import { app } from './app';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

app.listen(PORT, () => {
  console.log(`🍼 Baby Tracker API running on port ${PORT}`);
});
