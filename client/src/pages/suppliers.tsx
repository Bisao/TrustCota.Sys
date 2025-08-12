import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, Star, Eye, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SupplierForm from "@/components/suppliers/supplier-form";
import { Supplier } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export default function Suppliers() {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: t('active') },
      inactive: { variant: "secondary" as const, label: t('inactive') },
      pending: { variant: "secondary" as const, label: t('pending') },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex items-center">
        <span className="text-sm font-semibold text-foreground mr-2">{numRating.toFixed(1)}</span>
        <div className="flex text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < fullStars ? 'fill-current' : 
                i === fullStars && hasHalfStar ? 'fill-current opacity-50' : 
                'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {t('addSupplier')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('createSupplier')}</DialogTitle>
            </DialogHeader>
            <SupplierForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('suppliers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t('loadingSuppliers')}</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noSuppliersFound')}
            </div>
          ) : (
            <div className="grid gap-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-medium text-lg">{supplier.name}</h3>
                          {getStatusBadge(supplier.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>{t('contact')}:</strong> {supplier.contactEmail}</p>
                          <p><strong>Rating:</strong> {renderStars(supplier.rating)}</p>
                          <p><strong>{t('orders')}:</strong> {supplier.totalOrders}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setIsViewDialogOpen(true);
                          }}
                          data-testid={`button-view-${supplier.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t('view')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setIsEditDialogOpen(true);
                          }}
                          data-testid={`button-edit-${supplier.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t('edit')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Supplier Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Fornecedor</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email de Contato</label>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.contactEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <p className="text-sm text-muted-foreground">{renderStars(selectedSupplier.rating)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total de Pedidos</label>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.totalOrders}</p>
                </div>
              </div>
              {selectedSupplier.address && (
                <div>
                  <label className="text-sm font-medium">Endereço</label>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierForm 
              supplier={selectedSupplier}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedSupplier(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}