require 'nokogiri'
require 'optparse'

# Helper functions to parse path data commands
def parse_path_data(path_data)
  commands = path_data.scan(/([a-zA-Z])([^a-zA-Z]*)/).map { |cmd, params| [cmd, params.strip] }
  absolute_coordinates = []
  current_position = [0, 0]

  commands.each do |cmd, params|
    points = params.split(/[\s,]+/).map(&:to_f).each_slice(2).to_a

    case cmd
    when 'M', 'm' # MoveTo
      points.each_with_index do |point, index|
        if cmd == 'm' && index > 0
          current_position = [current_position[0] + point[0], current_position[1] + point[1]]
        else
          current_position = point if cmd == 'M' || index == 0
        end
        absolute_coordinates << [current_position.dup]
      end
    when 'L', 'l' # LineTo
      points.each do |point|
        if cmd == 'l'
          current_position = [current_position[0] + point[0], current_position[1] + point[1]]
        else
          current_position = point
        end
        absolute_coordinates.last << current_position.dup
        absolute_coordinates << [current_position.dup]
      end
    when 'C', 'c' # Cubic Bézier Curve
      points.each_slice(3) do |ctrl1, ctrl2, end_point|
        if cmd == 'c'
          ctrl1 = [current_position[0] + ctrl1[0], current_position[1] + ctrl1[1]]
          ctrl2 = [current_position[0] + ctrl2[0], current_position[1] + ctrl2[1]]
          end_point = [current_position[0] + end_point[0], current_position[1] + end_point[1]]
        end
        absolute_coordinates.last << ctrl1.dup
        absolute_coordinates.last << ctrl2.dup
        absolute_coordinates.last << end_point.dup
        current_position = end_point
        absolute_coordinates << [current_position.dup]
      end
    when 'Q', 'q' # Quadratic Bézier Curve
      points.each_slice(2) do |ctrl1, end_point|
        if cmd == 'q'
          ctrl1 = [current_position[0] + ctrl1[0], current_position[1] + ctrl1[1]]
          end_point = [current_position[0] + end_point[0], current_position[1] + end_point[1]]
        end
        absolute_coordinates.last << ctrl1.dup
        absolute_coordinates.last << end_point.dup
        current_position = end_point
        absolute_coordinates << [current_position.dup]
      end
    end
  end

  absolute_coordinates.pop if absolute_coordinates.last.size == 1
  absolute_coordinates
end

# Convert coordinates from y-down to y-up coordinate system
def convert_coordinates(strokes)
  strokes.map do |path|
    path.map do |curve|
      curve.map do |point|
        [point[0], -point[1]]
      end
    end
  end
end

# Main script
options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: ruby svg_parser.rb [options]"
  opts.on('-f', '--file FILE', 'Input SVG file') do |v|
    options[:file] = v
  end
end.parse!

if options[:file].nil?
  puts "Usage: ruby svg_parser.rb --file <path_to_svg>"
  exit 1
end

svg_file = options[:file]
svg_name = File.basename(svg_file, File.extname(svg_file))
output_file = "#{svg_name}Image.cjs"

# Parse the SVG with Nokogiri, including handling namespaces
doc = Nokogiri::XML(File.read(svg_file))
svg_element = doc.at_xpath('//xmlns:svg', xmlns: 'http://www.w3.org/2000/svg')

if svg_element.nil?
  puts "Error: No <svg> element found in #{svg_file}"
  exit 1
end

# Extract width and height from the SVG element
svg_width = svg_element.attr('width')&.to_f
svg_height = svg_element.attr('height')&.to_f

if svg_width.nil? || svg_height.nil?
  puts "Error: <svg> width and/or height attributes are missing in #{svg_file}"
  exit 1
end

strokes = doc.xpath('//xmlns:path', xmlns: 'http://www.w3.org/2000/svg').map do |path|
  path_data = path.attr('d')
  parse_path_data(path_data)
end

normalized_strokes = convert_coordinates(strokes)

# Write the coordinates into a text file
File.open(output_file, 'w') do |file|
  file.puts "#{svg_name}Image = ["
  normalized_strokes.each_with_index do |path, p_idx|
    file.puts "    // path #{p_idx + 1}"
    file.puts "    ["
    path.each_with_index do |curve, c_idx|
      points_str = curve.map { |point| "[#{point.join(', ')}]" }.join(', ')
      file.puts "        [#{points_str}]#{"," unless c_idx == path.size - 1}"
    end
    file.puts "    ]#{"," unless p_idx == normalized_strokes.size - 1}"
  end
  file.puts "];"
end