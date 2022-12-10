# [Choice] Node.js version: 14, 16, 18
ARG VARIANT="18-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# Install additional OS packages.
RUN sudo apt update && export DEBIAN_FRONTEND=noninteractive \
    && sudo apt -y install python3-pip python-dev jq

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# To install more global node packages.
RUN su node -c "npm install -g pnpm@7 ts-node typescript"

# Install Python depend dependencie.
RUN su node -c "pip3 install -U pip setuptools"
RUN su node -c "pip3 install ipykernel pandas autopep8 Jinja2 mysql-connector-python mycli nbconvert"

# Install TiUP cli, you can startup a TiDB cluster by `tiup playground` command.
RUN curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
