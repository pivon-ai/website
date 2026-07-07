# Pivon website — dev commands

# Opens the design-evolution showcase: every round of mocks on one horizontal
# timeline (time →, editions ↓); tiles are live previews, click opens full-page.
# Serves mockups/ so both mockups/*.html (hero era) and mockups/v/* are reachable.
.PHONY: showcase
showcase:
	@echo "Pivon design showcase → http://localhost:7322/v/showcase.html  (Ctrl-C to stop)"
	@( sleep 1; open "http://localhost:7322/v/showcase.html" ) >/dev/null 2>&1 &
	@python3 -m http.server 7322 -d mockups
