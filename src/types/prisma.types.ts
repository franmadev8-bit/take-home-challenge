import { Notifications, Prisma, RevokedToken, User } from '../generated/prisma/client.js';


export type ModelName = Prisma.ModelName;

type Ops<M extends ModelName> = Prisma.TypeMap['model'][M]['operations'];


export type Args<M extends ModelName, Op extends keyof Ops<M>> = Ops<M>[Op] extends { args?: infer A } ? A : never;

type EntityMap = {
    User: User;
    Notifications: Notifications;
    RevokedToken: RevokedToken;
}

export type Entity<M extends ModelName> = EntityMap[M];

export type Delegate<M extends ModelName> = {
    findUnique(args: Args<M, 'findUnique'>): Promise<Entity<M>>;
    findMany(args?: Args<M, 'findMany'>): Promise<Entity<M>[]>;
    create(args: Args<M, 'create'>): Promise<Entity<M>>;
    update(args: Args<M, 'update'>): Promise<Entity<M>>;
    delete(args: Args<M, 'delete'>): Promise<Entity<M>>;
}
