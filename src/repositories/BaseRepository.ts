import { PrismaService } from "../prisma/prisma.service.js";
import { Args, Delegate, Entity, ModelName } from "../types/prisma.types.js";

export abstract class BaseRepository<M extends ModelName> {
    protected constructor(
        private readonly prisma: PrismaService,
        private readonly model: M
    ) { }

    private get delegate(): Delegate<M> {
        const key = (this.model[0].toLowerCase() + this.model.slice(1)) as Uncapitalize<M>;
        return this.prisma[key] as unknown as Delegate<M>
    }

    Get(args?: Args<M, 'findMany'>): Promise<Entity<M>[]> {
        return this.delegate.findMany(args);
    }

    GetOne(args: Args<M, 'findUnique'>): Promise<Entity<M>> {
        return this.delegate.findUnique(args);
    }

    Create(args: Args<M, 'create'>): Promise<Entity<M>> {
        return this.delegate.create(args);
    }

    Update(args: Args<M, 'update'>): Promise<Entity<M>> {
        return this.delegate.update(args);
    }

    Delete(args: Args<M, 'delete'>): Promise<Entity<M>> {
        return this.delegate.delete(args);
    }
}