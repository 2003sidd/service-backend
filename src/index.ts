import express from 'express';
import cors from "cors"
import connectDb from './utility/db';
import dotenv from "dotenv"
import userRouter from './routes/user.route';
import employeeRouter from './routes/employee.route';
import serviceRouter from './routes/service.route';
import configRouter from './routes/config.route';
import dashboardRouter from './routes/dashboard.route';


dotenv.config();  // Load .env variables


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// connection with mongo db database
connectDb();
app.use('/uploads', express.static('./uploads'));

app.use('/api/user', userRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/service', serviceRouter)
app.use('/api/config', configRouter);
app.use('/api/dashboard', dashboardRouter)

app.get('/', (_req, res) => {
  res.send('Hello, TypeScript + Express!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
