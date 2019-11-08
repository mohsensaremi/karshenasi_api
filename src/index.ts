import './global';
import express, {Application} from 'express';

const app: Application = express();

app.get("/x", contextProvider());

app.listen(process.env.APP_PORT, () =>
    console.log(`🚀 Server ready at http://localhost:${process.env.APP_PORT}`),
);
