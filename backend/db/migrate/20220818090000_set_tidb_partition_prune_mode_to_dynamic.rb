class SetTidbPartitionPruneModeToDynamic < ActiveRecord::Migration[6.1]
  def change
    execute("SET GLOBAL tidb_partition_prune_mode = 'dynamic'")
  end
end
