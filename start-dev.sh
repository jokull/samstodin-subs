#!/bin/bash

# Start a new tmux session and create the first window (tab)
tmux new-session -d -s samstodin -n tunnel 'cloudflared tunnel --config ~/.cloudflared/samstodin-subs.yaml run --protocol http2'

# Set mouse support and increase scrollback buffer for this session
tmux set -t samstodin mouse on
tmux set -t samstodin history-limit 10000

# Create additional windows (tabs) for other commands
tmux new-window -t samstodin -n next 'bun run dev'

# Customize the status bar for this session
tmux set -t samstodin status-right ''

# Select the 'next' tab as default
tmux select-window -t samstodin:next

# Attach to the tmux session
tmux attach-session -t samstodin
