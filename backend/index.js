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
const query_generator = require('./routes_db/query_generator');
const query_extractor = require('./routes_db/query_extractor');
const query_insertion = require('./routes_db/query_insertion');


app.use('/add-endpoint',endpoint);
app.use('/add-project',project);
app.use('/add-user',user);
app.use('/data',data);
app.use('/generator', query_generator);
app.use('/extractor', query_extractor);
app.use('/insertion', query_insertion);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
