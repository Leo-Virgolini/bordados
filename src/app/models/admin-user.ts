export class AdminUser {

  id: string;
  username: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  role: 'admin' | 'super_admin' | 'moderator';
  lastLogin?: Date;
  isActive: boolean;

  constructor(init?: Partial<AdminUser>) {
    this.id = init?.id || crypto.randomUUID();
    this.username = init?.username || '';
    this.email = init?.email || '';
    this.name = init?.name || '';
    this.isLoggedIn = init?.isLoggedIn ?? false;
    this.role = init?.role || 'admin';
    this.lastLogin = init?.lastLogin;
    this.isActive = init?.isActive ?? true;
  }

  // Authentication methods
  get isAuthenticated(): boolean {
    return this.isLoggedIn && this.isActive && this.validateEmail();
  }

  get displayName(): string {
    return this.name || this.username;
  }

  get isSuperAdmin(): boolean {
    return this.role === 'super_admin';
  }

  get isModerator(): boolean {
    return this.role === 'moderator';
  }

  get canManageUsers(): boolean {
    return this.role === 'super_admin' || this.role === 'admin';
  }

  get canManageProducts(): boolean {
    return this.role === 'super_admin' || this.role === 'admin' || this.role === 'moderator';
  }

  // Validation methods
  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email.trim());
  }

  validateUsername(): boolean {
    return this.username.trim().length >= 3 && this.username.trim().length <= 50;
  }

  validateName(): boolean {
    return this.name.trim().length >= 2 && this.name.trim().length <= 100;
  }

  validate(): boolean {
    return this.validateName() &&
      this.validateEmail() &&
      this.validateUsername() &&
      this.isActive;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.validateName()) {
      errors.push('El nombre debe tener entre 2 y 100 caracteres');
    }

    if (!this.validateEmail()) {
      errors.push('El email debe tener un formato válido');
    }

    if (!this.validateUsername()) {
      errors.push('El nombre de usuario debe tener entre 3 y 50 caracteres');
    }

    if (!this.isActive) {
      errors.push('El usuario debe estar activo');
    }

    return errors;
  }

  // Authentication methods
  login(): void {
    this.isLoggedIn = true;
    this.lastLogin = new Date();
  }

  logout(): void {
    this.isLoggedIn = false;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
    this.isLoggedIn = false;
  }

  // Utility methods
  hasPermission(permission: string): boolean {
    switch (permission) {
      case 'manage_users':
        return this.canManageUsers;
      case 'manage_products':
        return this.canManageProducts;
      case 'view_analytics':
        return this.role === 'super_admin' || this.role === 'admin';
      case 'manage_orders':
        return this.role === 'super_admin' || this.role === 'admin';
      default:
        return false;
    }
  }

  // Factory methods
  static createAdmin(
    username: string,
    email: string,
    name: string,
    role: 'admin' | 'super_admin' | 'moderator' = 'admin'
  ): AdminUser {
    return new AdminUser({
      username,
      email,
      name,
      role
    });
  }

  static createSuperAdmin(
    username: string,
    email: string,
    name: string
  ): AdminUser {
    return new AdminUser({
      username,
      email,
      name,
      role: 'super_admin'
    });
  }

  clone(): AdminUser {
    return new AdminUser(this);
  }

} 