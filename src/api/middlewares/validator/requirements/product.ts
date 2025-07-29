import { body, param } from 'express-validator';

const productRequirement = {
    create: [
        body('name').isString(),
        body('price').isNumeric(),
        body('available')
            .isBoolean()
            .optional({ nullable: true })
            .default({ default: true }),
        body('description').isString().optional({ nullable: true }),
        // body('vendor').isString(),
        body('category').isString().optional({ nullable: true }),
        body('image').isArray().optional({ nullable: true }),
        body('thumbnail').isString().optional({ nullable: true })
    ],
    createCategory: [
        body('name').isString(),
        body('description').isString().optional({ nullable: true })
        // body('vendor').isString(),
    ],
    getSingle: [param('id').isInt()],
    update: [
        param('id').isInt(),
        body('name').isString().optional({ nullable: true }),
        body('price').isNumeric().optional({ nullable: true }),
        body('available')
            .isBoolean()
            .optional({ nullable: true })
            .default({ default: true })
            .optional({ nullable: true }),
        body('description').isString().optional({ nullable: true }),
        // body('vendor').isString(),
        body('category').isString().optional({ nullable: true }),
        body('image').isString().optional({ nullable: true }),
        // body('thumbnail').isString().optional({ nullable: true }),
        body('status').isString().optional({ nullable: true })
    ],
    updateStatus: [param('id').isString(), body('status').isString()],
    deleteUser: [param('id').isString()],
    createFavourite: [body('vendorId').isString(), body('productId').isString()]
};

export default productRequirement;
