import AuditLogModel from '../models/AuditLog';

class AuditService {
    async log(data: {
        adminId: string;
        action: string;
        resource: string;
        resourceId?: string;
        details?: any;
        ip?: string;
        userAgent?: string;
        status?: 'success' | 'failure';
        errorMessage?: string;
    }) {
        try {
            return await AuditLogModel.create(data);
        } catch (error) {
            console.error('Audit Logging Failed:', error);
        }
    }

    async getLogs(params: any = {}) {
        const { page = 1, limit = 10, adminId, action, resource } = params;
        const query: any = {};
        if (adminId) query.adminId = adminId;
        if (action) query.action = action;
        if (resource) query.resource = resource;

        const logs = await AuditLogModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('adminId', 'firstName lastName email');

        const total = await AuditLogModel.countDocuments(query);

        return { logs, total, page, limit };
    }
}

export default new AuditService();
