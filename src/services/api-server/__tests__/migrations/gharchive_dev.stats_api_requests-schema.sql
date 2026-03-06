CREATE TABLE stats_api_requests (
    client_ip      VARCHAR(128) DEFAULT ''                NOT NULL,
    client_origin  VARCHAR(255) DEFAULT ''                NOT NULL,
    method         ENUM('GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE') NOT NULL,
    path           VARCHAR(255)                           NULL,
    query          JSON                                   NULL,
    status_code    INT                                    NULL,
    error          TINYINT(1)   DEFAULT 0                 NOT NULL,
    is_dev         TINYINT(1)   DEFAULT 0                 NOT NULL,
    duration       FLOAT,
    finished_at    DATETIME     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    KEY idx_sar_on_finished_at(finished_at),
    KEY idx_sar_on_path(path),
    KEY idx_sar_on_client_ip(client_ip),
    KEY idx_sar_on_client_origin(client_origin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
PARTITION BY RANGE COLUMNS (finished_at) INTERVAL (1 MONTH)
FIRST PARTITION LESS THAN ('2023-08-01')
LAST PARTITION LESS THAN ('2025-01-01');