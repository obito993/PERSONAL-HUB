import { PrismaClient } from '@prisma/client';
import { AgentMemoryService } from './memory-service';
import { WebSearchService } from './web-search-service';

const prisma = new PrismaClient();


export interface AgentToolCall {
  name: string;
  args: Record<string, any>;
}

export interface AgentToolResult {
  toolName: string;
  success: boolean;
  result: any;
  error?: string;
}

export class AgentToolRegistry {
  /**
   * Execute an agent tool safely scoped to the authenticated user ID
   */
  static async executeTool(
    userId: string,
    toolName: string,
    args: Record<string, any>,
    taskId?: string
  ): Promise<AgentToolResult> {
    let result: any = null;
    let success = true;
    let error: string | undefined = undefined;

    try {
      switch (toolName) {
        // 1. Search user's study library
        case 'search_study_library': {
          const query = args.query || '';
          const docs = await prisma.studyDocument.findMany({
            where: {
              userId,
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { fileName: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              title: true,
              fileName: true,
              pageCount: true,
              createdAt: true,
            },
            take: 5,
          });
          result = { documents: docs, count: docs.length };
          break;
        }

        // 2. Read specific study document details/chapters
        case 'get_study_document_details': {
          const docId = args.documentId;
          const doc = await prisma.studyDocument.findFirst({
            where: { id: docId, userId },
            include: { chapters: { select: { id: true, chapterNumber: true, title: true } } },
          });
          if (!doc) throw new Error('Study document not found or access denied');
          result = doc;
          break;
        }

        // 3. Create personal user task
        case 'create_user_task': {
          const title = args.title;
          const category = args.category || 'GENERAL';
          if (!title) throw new Error('Task title required');
          const newTask = await prisma.task.create({
            data: { userId, title, category, completed: false },
          });
          result = newTask;
          break;
        }

        // 4. List user tasks
        case 'list_user_tasks': {
          const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
          });
          result = { tasks, total: tasks.length };
          break;
        }

        // 5. Save persistent agent memory
        case 'save_agent_memory': {
          const category = args.category || 'fact';
          const content = args.content;
          if (!content) throw new Error('Memory content required');
          const saved = await AgentMemoryService.saveMemory(userId, category, content, 'agent_tool', args.importance || 1);
          result = saved;
          break;
        }

        // 6. Search agent memories
        case 'search_agent_memories': {
          const query = args.query || '';
          const memories = await AgentMemoryService.recallRelevantMemories(userId, query);
          result = memories;
          break;
        }

        // 7. Get user career applications
        case 'get_career_applications': {
          const apps = await prisma.careerApplication.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 10,
          });
          result = { applications: apps };
          break;
        }

        // 8. List user habits
        case 'list_user_habits': {
          const habits = await prisma.habit.findMany({
            where: { userId },
            take: 10,
          });
          result = { habits };
          break;
        }

        // 9. Real Web Search / Research
        case 'web_search': {
          const query = args.query || args.searchQuery || '';
          if (!query) throw new Error('Search query required for web_search');
          const searchRes = await WebSearchService.search(query, 5);
          result = {
            query,
            count: searchRes.results.length,
            results: searchRes.results,
            sources: searchRes.sources,
          };
          break;
        }

        default:
          throw new Error(`Unknown agent tool: ${toolName}`);
      }

    } catch (err: any) {
      success = false;
      error = err.message || 'Tool execution failed';
    }

    // Log execution to AgentAuditLog
    try {
      await prisma.agentAuditLog.create({
        data: {
          userId,
          taskId: taskId || null,
          toolName,
          actionSummary: success
            ? `Successfully executed ${toolName}`
            : `Failed executing ${toolName}: ${error}`,
          approvalStatus: 'APPROVED',
          detailsJson: JSON.stringify({ args, result, error }),
        },
      });
    } catch (logErr) {
      console.warn('Failed to log audit entry:', logErr);
    }

    return { toolName, success, result, error };
  }
}
