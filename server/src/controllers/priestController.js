export const getActivePriest = (_req, res) => {
  const priest = {
    _id: 'single-priest',
    name: 'Parish Priest',
    churchName: 'St. Michael Church',
    isActive: true
  };

  return res.json({
    success: true,
    priest,
    data: priest,
    id: priest._id,
    name: priest.name,
    isActive: priest.isActive
  });
};
