import { Router, RequestHandler } from 'express';
import { TodoController } from '@/controllers/todoController';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

// Toutes les routes sont protégées
router.post('/', authMiddleware as RequestHandler, TodoController.createTodo);
router.get('/', authMiddleware as RequestHandler, TodoController.getAllUserTodos);
router.get('/invitation/:invitationId', authMiddleware as RequestHandler, TodoController.getTodosByInvitation);
router.get('/invitation/:invitationId/stats', authMiddleware as RequestHandler, TodoController.getTodoStats);
router.get('/:id', authMiddleware as RequestHandler, TodoController.getTodoById);
router.put('/:id', authMiddleware as RequestHandler, TodoController.updateTodo);
router.delete('/:id', authMiddleware as RequestHandler, TodoController.deleteTodo);

export default router;

