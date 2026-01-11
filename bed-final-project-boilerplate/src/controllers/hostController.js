import * as hostService from '../services/hostService.js';
const prismaToHttp = (err, res, fallbackMsg) => {
  const code = err?.code;
  if (code === 'P2025') return res.status(404).json({ message: err?.meta?.cause || 'Not found' });
  if (err?.name === 'PrismaClientValidationError' || String(code || '').startsWith('P20')) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  return res.status(500).json({ message: fallbackMsg });
};
export const getAllHosts = async (req, res) => {
  try {
    const { name } = req.query;
    const hosts = await hostService.getAllHosts({ name });
    res.json(hosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHostById = async (req, res) => {
  try {
    const { id } = req.params;
    const host = await hostService.getHostById(id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json(host);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHost = async (req, res) => {
  try {
    const { username, password, name, email } = req.body ?? {};
    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const host = await hostService.createHost(req.body);
    return res.status(201).json(host);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to create host');
  }
};

export const updateHost = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    const host = await hostService.updateHost(id, req.body);
    return res.json(host);
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to update host');
  }
};

export const deleteHost = async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!id) return res.status(400).json({ message: 'Invalid id' });
  try {
    await hostService.deleteHost(id);
    return res.json({ message: 'Host deleted' });
  } catch (err) {
    console.error(err);
    return prismaToHttp(err, res, 'Failed to delete host');
  }
};