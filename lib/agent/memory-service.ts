import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AgentMemoryService {
  /**
   * Fetch all memories for a user
   */
  static async getMemories(userId: string, category?: string) {
    const where: any = { userId };
    if (category) {
      where.category = category;
    }
    return prisma.agentMemory.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Save or update a memory item for a specific user
   */
  static async saveMemory(
    userId: string,
    category: 'preference' | 'project' | 'fact' | 'workflow',
    content: string,
    source = 'user_input',
    importance = 1
  ) {
    // Check if duplicate memory exists
    const existing = await prisma.agentMemory.findFirst({
      where: {
        userId,
        category,
        content: { equals: content, mode: 'insensitive' },
      },
    });

    if (existing) {
      return prisma.agentMemory.update({
        where: { id: existing.id },
        data: { updatedAt: new Date(), importance: Math.max(existing.importance, importance) },
      });
    }

    return prisma.agentMemory.create({
      data: {
        userId,
        category,
        content,
        source,
        importance,
      },
    });
  }

  /**
   * Delete a memory item belonging to the user
   */
  static async deleteMemory(userId: string, memoryId: string) {
    return prisma.agentMemory.deleteMany({
      where: {
        id: memoryId,
        userId, // Enforce ownership
      },
    });
  }

  /**
   * Search relevant memories for an agent prompt
   */
  static async recallRelevantMemories(userId: string, query: string, limit = 5) {
    const allMemories = await prisma.agentMemory.findMany({
      where: { userId },
      orderBy: { importance: 'desc' },
    });

    if (allMemories.length === 0) return [];

    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter((w) => w.length > 2);

    // Simple keyword matching & relevance scoring
    const scored = allMemories.map((mem) => {
      const contentLower = mem.content.toLowerCase();
      let score = 0;
      for (const word of words) {
        if (contentLower.includes(word)) score += 2;
      }
      return { mem, score: score + mem.importance };
    });

    return scored
      .filter((s) => words.length === 0 || s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.mem);
  }
}
