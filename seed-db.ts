import { db } from './server/db';
import { users, campaigns, tasks, activities, assets } from './shared/schema';

async function seed() {
  console.log('Seeding the database...');
  
  try {
    // Add users
    const user1 = await db.insert(users).values({
      username: 'jsmith',
      password: 'password123',
      name: 'John Smith',
      role: 'admin',
      initials: 'JS'
    }).returning();

    const user2 = await db.insert(users).values({
      username: 'agarcia',
      password: 'password123',
      name: 'Ana Garcia',
      role: 'agent',
      initials: 'AG'
    }).returning();

    const user3 = await db.insert(users).values({
      username: 'mjohnson',
      password: 'password123',
      name: 'Michael Johnson',
      role: 'agent',
      initials: 'MJ'
    }).returning();

    console.log('Users created:', user1, user2, user3);
    
    // Add campaigns
    const campaign1 = await db.insert(campaigns).values({
      name: 'Summer Homes 2025',
      description: 'Campaign for promoting summer homes in coastal areas',
      status: 'active',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-08-31'),
      progress: 25,
      budget: 10000,
      targetAudience: 'High-income families',
      channels: ['email', 'social', 'print'],
      createdBy: user1[0].id
    }).returning();

    const campaign2 = await db.insert(campaigns).values({
      name: 'Downtown Condos',
      description: 'Campaign for luxury condos in downtown area',
      status: 'draft',
      startDate: new Date('2025-06-15'),
      endDate: new Date('2025-12-31'),
      progress: 0,
      budget: 15000,
      targetAudience: 'Young professionals',
      channels: ['email', 'social', 'events'],
      createdBy: user1[0].id
    }).returning();

    const campaign3 = await db.insert(campaigns).values({
      name: 'Suburban Estates',
      description: 'Campaign for new housing development in suburbs',
      status: 'active',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-10-31'),
      progress: 45,
      budget: 12000,
      targetAudience: 'Families with children',
      channels: ['email', 'print', 'billboards'],
      createdBy: user2[0].id
    }).returning();
    
    console.log('Campaigns created:', campaign1, campaign2, campaign3);

    // Add tasks
    const task1 = await db.insert(tasks).values({
      title: 'Create promotional materials',
      description: 'Design brochures and flyers for Summer Homes campaign',
      campaignId: campaign1[0].id,
      assigneeId: user2[0].id,
      dueDate: new Date('2025-04-20'),
      priority: 'high',
      completed: false
    }).returning();

    const task2 = await db.insert(tasks).values({
      title: 'Organize open house event',
      description: 'Plan and organize open house for Downtown Condos',
      campaignId: campaign2[0].id,
      assigneeId: user3[0].id,
      dueDate: new Date('2025-07-10'),
      priority: 'medium',
      completed: false
    }).returning();

    const task3 = await db.insert(tasks).values({
      title: 'Social media content',
      description: 'Create and schedule social media posts for Suburban Estates',
      campaignId: campaign3[0].id,
      assigneeId: user2[0].id,
      dueDate: new Date('2025-04-15'),
      priority: 'medium',
      completed: true
    }).returning();
    
    console.log('Tasks created:', task1, task2, task3);

    // Add activities
    const activity1 = await db.insert(activities).values({
      userId: user1[0].id,
      campaignId: campaign1[0].id,
      actionType: 'created',
      content: 'Created the Summer Homes 2025 campaign'
    }).returning();

    const activity2 = await db.insert(activities).values({
      userId: user2[0].id,
      campaignId: campaign3[0].id,
      actionType: 'completed',
      content: 'Completed social media content task'
    }).returning();

    const activity3 = await db.insert(activities).values({
      userId: user3[0].id,
      campaignId: campaign2[0].id,
      actionType: 'commented',
      content: 'Added some notes about target demographics'
    }).returning();
    
    console.log('Activities created:', activity1, activity2, activity3);

    // Add assets
    const asset1 = await db.insert(assets).values({
      name: 'Summer Homes Brochure',
      type: 'document',
      url: 'https://example.com/brochure1.pdf',
      campaignId: campaign1[0].id,
      uploadedBy: user1[0].id
    }).returning();

    const asset2 = await db.insert(assets).values({
      name: 'Downtown Condos Floor Plan',
      type: 'image',
      url: 'https://example.com/floorplan.jpg',
      campaignId: campaign2[0].id,
      uploadedBy: user2[0].id
    }).returning();
    
    console.log('Assets created:', asset1, asset2);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();