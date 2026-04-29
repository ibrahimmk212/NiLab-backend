import mongoose, { Document, Schema } from 'mongoose';

export interface AuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ip?: string;
    userAgent?: string;
    status: 'success' | 'failure';
    errorMessage?: string;
}

const auditLogSchema = new Schema<AuditLog>(
    {
        adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        action: { type: String, required: true },
        resource: { type: String, required: true },
        resourceId: { type: String },
        details: { type: Schema.Types.Mixed },
        ip: { type: String },
        userAgent: { type: String },
        status: { type: String, enum: ['success', 'failure'], default: 'success' },
        errorMessage: { type: String }
    },
    {
        timestamps: true
    }
);

const AuditLogModel = mongoose.model<AuditLog>('AuditLog', auditLogSchema);

export default AuditLogModel;
