async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '10' } = req.query;
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);

  try {
    const [categories, totalCount] = await prisma.$transaction([
      prisma.category.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: {
          department: true,
          parentCategory: true,
          subCategories: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.count(),
    ]);

    res.status(200).json({
      categories,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
}
