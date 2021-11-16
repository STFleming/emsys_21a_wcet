
all: node_modules

node_modules:
	npm install ws
	npm install express

run: node_modules server.js
	node server.js 

clean:
	rm -rf node_modules
	rm -rf package-lock.json
