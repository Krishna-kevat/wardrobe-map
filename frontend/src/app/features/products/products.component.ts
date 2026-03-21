import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
    products: any[] = [];
    loading = true;
    error = '';

    categoryFilter = '';

    // Modal State
    showModal = false;
    isEditMode = false;
    modalTitle = 'Add Product';
    currentProductId: string | null = null;

    productForm: FormGroup;
    selectedFile: File | null = null;
    filePreview: string | null = null;

    constructor(private adminService: AdminService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
        this.productForm = this.fb.group({
            product_name: ['', Validators.required],
            title: ['', Validators.required],
            description: ['', Validators.required],
            category: ['Male', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            delivery_charge: [0, Validators.min(0)],
            sizes: ['']
        });
    }

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.loading = true;
        this.adminService.getProducts(this.categoryFilter).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.products = res.data;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to load products';
                this.loading = false;
                this.cdr.detectChanges();
                console.error(err);
            }
        });
    }

    onFilterChange() {
        this.loadProducts();
    }

    openAddModal() {
        this.isEditMode = false;
        this.modalTitle = 'Add New Product';
        this.currentProductId = null;
        this.productForm.reset({ category: 'Male', price: 0, stock: 0, delivery_charge: 0, sizes: '' });
        this.selectedFile = null;
        this.filePreview = null;
        this.showModal = true;
    }

    openEditModal(product: any) {
        this.isEditMode = true;
        this.modalTitle = 'Edit Product';
        this.currentProductId = product._id;
        this.productForm.patchValue({
            product_name: product.product_name,
            title: product.title,
            description: product.description,
            category: product.category,
            price: product.price,
            stock: product.stock,
            delivery_charge: product.delivery_charge,
            sizes: product.sizes ? product.sizes.join(', ') : ''
        });
        this.selectedFile = null;
        this.filePreview = product.image ? 'https://wardrobe-backend-8v0j.onrender.com' + product.image : null;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.filePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    saveProduct() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            return;
        }

        const formData = new FormData();
        Object.keys(this.productForm.value).forEach(key => {
            formData.append(key, this.productForm.value[key]);
        });

        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        }

        if (this.isEditMode && this.currentProductId) {
            this.adminService.updateProduct(this.currentProductId, formData).subscribe({
                next: () => {
                    this.loadProducts();
                    this.closeModal();
                },
                error: (err: any) => {
                    alert('Failed to update product: ' + (err.error?.message || err.message));
                }
            });
        } else {
            this.adminService.createProduct(formData).subscribe({
                next: () => {
                    this.loadProducts();
                    this.closeModal();
                },
                error: (err: any) => {
                    alert('Failed to create product: ' + (err.error?.message || err.message));
                }
            });
        }
    }

    deleteProduct(id: string) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.adminService.deleteProduct(id).subscribe({
                next: () => {
                    this.products = this.products.filter(p => p._id !== id);
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    alert('Failed to delete product');
                }
            });
        }
    }

    getImageUrl(imagePath: string): string {
        return imagePath ? 'https://wardrobe-backend-8v0j.onrender.com' + imagePath : 'assets/no-img.png';
    }

    copyProductId(id: string) {
        navigator.clipboard.writeText(id).then(() => {
            alert('Product ID updated to clipboard: ' + id);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy Product ID');
        });
    }
}
