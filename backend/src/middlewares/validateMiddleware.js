/**
 * Zod validation middleware wrapper
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
      }
      req.body = parsed.data;
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data format',
      });
    }
  };
}
