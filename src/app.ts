import express from 'express';
import cors from "cors"
import connectDb from './utility/db';
import dotenv from "dotenv"
import userRouter from './routes/user.route';
import employeeRouter from './routes/employee.route';
import serviceRouter from './routes/service.route';
import configRouter from './routes/config.route';
import dashboardRouter from './routes/dashboard.route';
import serviceRequestRouter from './routes/serviceRequest.route';
import { authorize } from './middleware/jwt';
import notificationRoute from './routes/notification.route';

dotenv.config();  // Load .env variables


const app = express();
const PORT = parseInt(process.env.PORT ?? "8080", 10);


const HOST = '0.0.0.0';

app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use(cors({}));

app.use(cors({
  origin: 'http://sos-demo-frontend.s3-website.ap-south-1.amazonaws.com', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add methods as needed
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any headers that your frontend might use
}));

// connection with mongo db database
connectDb();
app.use('/uploads', express.static('./uploads'));

app.use('/api/user', userRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/service', authorize(), serviceRouter)
app.use('/api/config', authorize(), configRouter);
app.use('/api/dashboard', authorize(), dashboardRouter)
app.use('/api/notification', authorize(), notificationRoute)
app.use('/api/serviceRequest', authorize(), serviceRequestRouter)


app.get('/', (req, res) => {
  res.send("Hello from TypeScript on Elastic Beanstalk");
});


app.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
