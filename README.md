# Socket Communication example

This is a quick example of communication between two server side node components communication using Sockets.

# Master
The Master acts like a server process that listens for connections. When an agent connects to the master, it captures some identity information and then when needed can send a message (or instruction) to the agent. The agent in-turn provides results to the master to consolidate.


```
node master
```

# Agent
The Agent acts like a client that connects to the master. When connected it identifies itself and awaits for instructions.

```
node agent
```


This code is very primitive and can be expanded as needed.
