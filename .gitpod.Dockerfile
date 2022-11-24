FROM gitpod/workspace-node-lts

# Install Node.js global dependencies.
RUN npm i -g npm pnpm typescript

# Install TiUP cli, you can startup a TiDB cluster by `tiup playground` command.
RUN curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh

# Install mycli, you can connect to the TiDB cluster.
RUN sudo apt update && sudo apt install -y mycli
