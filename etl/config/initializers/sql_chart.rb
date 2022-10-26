class SqlChart
  attr_reader :sql, :client, :unit, :results

  def initialize(sql, unit = "▇")
    @sql = sql
    @client = ActiveRecord::Base.connection
    @unit = unit
  end

  def results
    @results ||= client.select_all(sql)
  end

  def headers
    results.columns
  end

  def to_array
    results.rows
  end

  def result_with_header
    [headers] + results.rows
  end

  def sum_num
    to_array.map{|x| x[1]}.sum
  end

  def max_column_length
    to_array.map { |x| x[0].size }.max
  end

  def array_with_percent_value
    to_array.map do |x|
      x + [(x[1].to_f / sum_num * 100).round]
    end
  end

  def to_text
    array_with_percent_value.map do |row|
      "#{row[0].rjust(max_column_length)} : #{unit * row[2]} #{row[1]}"
    end.join("\n")
  end

  def to_md
    MDTable.convert([headers] + to_array)
  end

  def to_md_with_bar
    new_headers = headers.dup 
    new_headers.insert 1, 'bar'
    new_array = to_array.map do |x|
      [
        x[0],   
        unit * (x[1].to_f / sum_num * 100).round,
        x[1]
      ]
    end
    MDTable.convert [new_headers] + new_array
  end

end