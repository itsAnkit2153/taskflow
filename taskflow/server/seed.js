const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany();
  await Project.deleteMany();
  await Task.deleteMany();

  // Users
  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@taskflow.com',
    password: 'password123',
    role: 'admin',
  });

  const member1 = await User.create({
    name: 'Bob Developer',
    email: 'bob@taskflow.com',
    password: 'password123',
    role: 'member',
  });

  const member2 = await User.create({
    name: 'Carol Designer',
    email: 'carol@taskflow.com',
    password: 'password123',
    role: 'member',
  });

  // Projects
  const project1 = await Project.create({
    title: 'Website Redesign',
    description: 'Complete overhaul of company website',
    owner: admin._id,
    members: [member1._id, member2._id],
    color: '#6366f1',
  });

  const project2 = await Project.create({
    title: 'Mobile App Launch',
    description: 'iOS and Android app development',
    owner: admin._id,
    members: [member1._id],
    color: '#10b981',
  });

  // Tasks
  const tasks = [
    { title: 'Design homepage mockups', description: 'Create Figma mockups for all pages', status: 'completed', priority: 'high', deadline: new Date('2025-05-01'), assignedTo: member2._id, project: project1._id, createdBy: admin._id },
    { title: 'Implement auth module', description: 'JWT login and signup', status: 'in_progress', priority: 'high', deadline: new Date('2025-06-15'), assignedTo: member1._id, project: project1._id, createdBy: admin._id },
    { title: 'Write API documentation', description: 'Document all REST endpoints', status: 'pending', priority: 'medium', deadline: new Date('2025-06-30'), assignedTo: member1._id, project: project1._id, createdBy: admin._id },
    { title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for deployment', status: 'pending', priority: 'low', deadline: new Date('2024-12-01'), assignedTo: member1._id, project: project2._id, createdBy: admin._id },
    { title: 'User testing session', description: 'Conduct usability tests with 5 users', status: 'pending', priority: 'medium', deadline: new Date('2025-07-01'), assignedTo: member2._id, project: project2._id, createdBy: admin._id },
  ];

  await Task.insertMany(tasks);

  console.log('✅ Seed data inserted!');
  console.log('\n📧 Demo Accounts:');
  console.log('Admin → admin@taskflow.com / password123');
  console.log('Member → bob@taskflow.com / password123');
  console.log('Member → carol@taskflow.com / password123');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
