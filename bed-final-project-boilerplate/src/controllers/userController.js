import * as userService from '../services/userService.js';
const prismaToHttp = (err, res, fallbackMsg) => {
  const code = err?.code;
  if (code === 'P2025') return res.status(404).json({ message: err?.meta?.cause || 'Not found' });
  if (err?.name === 'PrismaClientValidationError' || String(code || '').startsWith('P20')) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  return res.status(500).json({ message: fallbackMsg });
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
};

export const createUser = async (req, res) => {
  try {
    const { username, password, name, email } = req.body ?? {};
    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to create user');
  }
};
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name } = req.body;

  const user = await userService.findUserById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const updatedUser = await userService.updateUser(id, { email, name });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await userService.findUserById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    await userService.deleteUser(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};