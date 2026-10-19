const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let accounts = [
  { id: 1, code: 'EK-24001', title: 'Squad Epic Show Time', status: 'published', main_image_url: null },
  { id: 2, code: 'EK-24002', title: 'Skuad Liga Master - Rising Stars', status: 'draft', main_image_url: null },
  { id: 3, code: 'EK-24003', title: 'Squad Legends Indonesia', status: 'published', main_image_url: null },
  { id: 4, code: 'EK-24004', title: 'Skuad Arsenal Invincibles', status: 'archived', main_image_url: null },
];

export async function getAdminAccounts({ page = 1, limit = 12, status } = {}) {
  await wait(200);
  const filtered = status ? accounts.filter((account) => account.status === status) : accounts;
  const start = (page - 1) * limit;

  return {
    data: filtered.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: filtered.length,
      total_pages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  };
}

export async function archiveAccount(id) {
  await wait(150);
  accounts = accounts.map((account) =>
    account.id === id ? { ...account, status: 'archived' } : account,
  );
}

export async function deleteAccountPermanently(id) {
  await wait(150);
  accounts = accounts.filter((account) => account.id !== id);
}
