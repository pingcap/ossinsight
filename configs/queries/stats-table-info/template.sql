SELECT
    TABLE_SCHEMA AS tableSchema,
    TABLE_NAME AS tableName,
    TABLE_ROWS AS tableRows,
    AVG_ROW_LENGTH AS avgRowLength,
    DATA_LENGTH AS dataLength,
    INDEX_LENGTH AS indexLength,
    CREATE_TIME AS createTime,
    TABLE_COLLATION AS tableCollation,
    CREATE_OPTIONS AS createOptions,
    TIDB_ROW_ID_SHARDING_INFO AS rowIdShardingInfo,
    TIDB_PK_TYPE AS pkType
FROM INFORMATION_SCHEMA.TABLES
WHERE
    TABLE_SCHEMA = database()
    AND TABLE_NAME = 'github_events'
    AND TABLE_TYPE = 'BASE TABLE';