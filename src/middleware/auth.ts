import passport from 'passport';
import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import functionResponseError from '@util/responseError';
import { UserRoles } from '@model/user';

const AUTH_ERRORS = {
  INTERNAL: {
    status: httpStatus.INTERNAL_SERVER_ERROR,
    code: 'ERROR_INTERNAL',
    message: 'Authentication error',
  },
  UNAUTHORIZED: {
    status: httpStatus.UNAUTHORIZED,
    code: 'ERROR_UNAUTHENTICATED',
    message: 'Unauthorized',
  },
  FORBIDDEN: {
    status: httpStatus.FORBIDDEN,
    code: 'ERROR_FORBIDDEN',
    message: 'Insufficient permissions',
  },
};

export const check = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    try {
      if (err) {
        return res.status(AUTH_ERRORS.INTERNAL.status).json(AUTH_ERRORS.INTERNAL);
      }

      if (!user) {
        return res.status(AUTH_ERRORS.UNAUTHORIZED.status).json(AUTH_ERRORS.UNAUTHORIZED);
      }

      // เพิ่ม user ข้อมูลลงใน req object เพื่อใช้ใน controller
      req.user = user;
      next();
    } catch (error) {
      functionResponseError(error, res);
    }
  })(req, res, next);
};

export const authAndRole = (allowedRoles: (keyof typeof UserRoles)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
      try {
        if (err) {
          return res.status(AUTH_ERRORS.INTERNAL.status).json(AUTH_ERRORS.INTERNAL);
        }

        if (!user) {
          return res.status(AUTH_ERRORS.UNAUTHORIZED.status).json(AUTH_ERRORS.UNAUTHORIZED);
        }

        // เช็ค role
        const hasRequiredRole = user.roles.some((role: string) =>
          allowedRoles.includes(role as keyof typeof UserRoles)
        );

        if (!hasRequiredRole) {
          return res.status(AUTH_ERRORS.FORBIDDEN.status).json(AUTH_ERRORS.FORBIDDEN);
        }

        req.user = user;
        next();
      } catch (error) {
        functionResponseError(error, res);
      }
    })(req, res, next);
  };
};

export const requireAdmin = () => authAndRole([UserRoles.ADMIN, UserRoles.SUPERADMIN]);
export const requireOwner = () => authAndRole([UserRoles.OWNER, UserRoles.ADMIN, UserRoles.SUPERADMIN]);
export const requireEmployee = () =>
  authAndRole([UserRoles.EMPLOYEE, UserRoles.OWNER, UserRoles.ADMIN, UserRoles.SUPERADMIN]);
export const requireMember = () =>
  authAndRole([UserRoles.MEMBER, UserRoles.EMPLOYEE, UserRoles.OWNER, UserRoles.ADMIN, UserRoles.SUPERADMIN]);
