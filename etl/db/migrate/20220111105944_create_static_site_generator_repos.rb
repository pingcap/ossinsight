class CreateStaticSiteGeneratorRepos < ActiveRecord::Migration[6.1]
  def change
    create_table :static_site_generator_repos, id: false do |t|
      t.string :id, primary_key: true
      t.string :name
    end
  end
end
