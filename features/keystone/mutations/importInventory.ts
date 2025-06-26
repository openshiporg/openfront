async function importInventory(root, { file }, context) {
  // Create a batch job for processing the inventory import
  const batchJob = await context.query.BatchJob.createOne({
    data: {
      type: 'INVENTORY_UPDATE',
      status: 'CREATED',
      context: {
        fileKey: file,
        strategy: 'INVENTORY',
      }
    },
    query: 'id status'
  });

  return batchJob;
}

export default importInventory; 