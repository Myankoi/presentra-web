interface PageContainerProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}

export function PageContainer({ title, description, action, children }: PageContainerProps) {
    return (
        <div className="flex-1 space-y-6">
            {/* Page header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {action && <div className="flex items-center gap-2">{action}</div>}
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
