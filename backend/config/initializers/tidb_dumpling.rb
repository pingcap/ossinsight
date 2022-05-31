class TidbDumpling
  attr_reader :dump_dir, :db, :tables

  def initialize(dump_dir, db)
    @dump_dir = dump_dir
    @db = db
    @tables = %w[github_events] # ar_internal_metadata import_logs schema_migrations
  end

  def db_filename
    "#{db}-schema-create.sql"
  end

  def db_create_sql
    <<~SQL
    /*!40101 SET NAMES binary*/;
    CREATE DATABASE `#{db} /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
    SQL
  end

  def table_filename(table)
    "#{db}.#{table}-schema.sql"
  end

  def table_create_sql(table)
    show_create_table = ActiveRecord::Base.connection.select_one("show create table #{table}")['Create Table']
    <<~SQL
    /*!40101 SET NAMES binary*/;
    #{show_create_table}
    SQL
  end

  def run
    File.open(File.join(dump_dir, db_filename), "w+") do |f|
      f.write db_create_sql
    end
    tables.each do |table|
      File.open(File.join(dump_dir, table_filename(table)), "w+") do |f|
        f.write table_create_sql(table)
      end
    end
  end

  def table_csv_filename(id, table)
    id_str = '%09d' % id
    "#{db}.#{table}.#{id_str}.csv"
  end

  def save_table_rows_to_csv(id, table, columns, attrs)
    output_file = File.join(dump_dir, table_csv_filename(id, table))
    CSV.open(output_file, "w", {
        :col_sep => ",",
        :quote_char => '"',
        :force_quotes => true,
        :row_sep => "\n",
        :write_headers => true,
        :write_nil_value => "\\N",
        :headers => columns
    }) do |csv|
      attrs.each do |attr|
        csv << attr.values_at(*columns)
      end 
    end
  end

  def format_field
  end

  def save_table_rows_to_csv2(id, table, columns, attrs)
    output_file = File.join(dump_dir, table_csv_filename(id, table))
    File.open(output_file, "w") do |f|
      attrs.each_with_index do |attr, i|
        if i == 0
          f.write columns.map{|c| c.inspect }.join(",")
        end
        f.write "\n"
        f.write attr.values_at(*columns).map {|v| v.nil? ? "\\N" :  v.to_s.inspect}.join(",")
      end 
    end
  end
end

# gharchive_dev-schema-create.sql                   gharchive_dev.import_logs-schema.sql
# gharchive_dev.ar_internal_metadata-schema.sql     gharchive_dev.import_logs.000000000.csv
# gharchive_dev.ar_internal_metadata.000000000.csv  gharchive_dev.schema_migrations-schema.sql
# gharchive_dev.github_events-schema.sql            gharchive_dev.schema_migrations.000000000.csv
# gharchive_dev.github_events.000000000.csv         metadata