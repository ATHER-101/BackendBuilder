const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

const endpoint = require('./routes/endpoint');
const project = require('./routes/project');
const user = require('./routes/user');
const data = require('./routes/data');

app.use('/add-endpoint',endpoint);
app.use('/add-project',project);
app.use('/add-user',user);
app.use('/data',data);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
