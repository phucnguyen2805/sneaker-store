import { useCallback, useEffect, useRef, useState } from "react";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import {
  createCategory,
  deleteCategory,
  deleteCategoryImage,
  getCategories,
  updateCategory,
  uploadCategoryImage,
} from "../services/categoryService.js";

function AdminCategoryPage() {
  const { language } = useThemeLanguage();

  const text = {
    vi: {
      eyebrow: "Admin",
      title: "Quản lý Category",
      description: "Thêm, sửa, xóa danh mục và upload hình ảnh (Cloudinary).",
      name: "Tên danh mục",
      namePlaceholder: "Ví dụ: Giày thể thao, Quần áo...",
      logo: "Hình ảnh",
      noLogo: "Chưa có hình ảnh",
      add: "Thêm danh mục",
      save: "Lưu",
      cancel: "Hủy",
      edit: "Sửa",
      delete: "Xóa",
      upload: "Upload hình ảnh",
      removeLogo: "Xóa hình ảnh",
      empty: "Chưa có danh mục nào.",
      loading: "Đang tải...",
      saving: "Đang lưu...",
      uploading: "Đang upload...",
      loadError: "Không thể tải danh sách category.",
      saveError: "Không thể lưu category.",
      deleteError: "Không thể xóa category.",
      uploadError: "Không thể upload hình ảnh.",
      nameRequired: "Vui lòng nhập tên danh mục.",
      deleteTitle: "Xóa danh mục?",
      deleteBody:
        "Danh mục sẽ bị xóa vĩnh viễn. Không xóa được nếu đang có sản phẩm dùng danh mục này.",
      deleteConfirm: "Xóa danh mục",
      successCreate: "Đã thêm danh mục.",
      successUpdate: "Đã cập nhật danh mục.",
      successDelete: "Đã xóa danh mục.",
      successUpload: "Đã upload hình ảnh.",
      successRemoveLogo: "Đã xóa hình ảnh.",
    },
    en: {
      eyebrow: "Admin",
      title: "Manage categories",
      description:
        "Create, edit, delete categories and upload images (Cloudinary).",
      name: "Category name",
      namePlaceholder: "e.g. Sports shoes, Clothing...",
      logo: "Image",
      noLogo: "No image",
      add: "Add category",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      upload: "Upload image",
      removeLogo: "Remove image",
      empty: "No categories yet.",
      loading: "Loading...",
      saving: "Saving...",
      uploading: "Uploading...",
      loadError: "Unable to load categories.",
      saveError: "Unable to save category.",
      deleteError: "Unable to delete category.",
      uploadError: "Unable to upload image.",
      nameRequired: "Please enter a category name.",
      deleteTitle: "Delete category?",
      deleteBody:
        "This category will be permanently deleted. It cannot be deleted if products still use it.",
      deleteConfirm: "Delete category",
      successCreate: "Category created.",
      successUpdate: "Category updated.",
      successDelete: "Category deleted.",
      successUpload: "Image uploaded.",
      successRemoveLogo: "Image removed.",
    },
  };

  const t = text[language] || text.vi;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRefs = useRef({});

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCategories();
      setCategories(data);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    const fetchCategories = async () => {
      await loadCategories();
    };

    fetchCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setNameInput("");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = nameInput.trim();
    if (!name) {
      setError(t.nameRequired);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await updateCategory(editingId, name);
        setSuccess(t.successUpdate);
      } else {
        await createCategory(name);
        setSuccess(t.successCreate);
      }

      resetForm();
      await loadCategories();
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.saveError,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.id);
    setNameInput(brand.name || "");
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await deleteCategory(deletingId);

      if (editingId === deletingId) {
        resetForm();
      }

      setSuccess(t.successDelete);
      setDeleteModalOpen(false);
      setDeletingId(null);
      await loadCategories();
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.deleteError,
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadLogo = async (brandId, file) => {
    if (!file) return;

    try {
      setUploadingId(brandId);
      setError("");
      setSuccess("");

      await uploadCategoryImage(brandId, file);
      setSuccess(t.successUpload);
      await loadCategories();
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.uploadError,
      );
    } finally {
      setUploadingId(null);
      if (fileInputRefs.current[brandId]) {
        fileInputRefs.current[brandId].value = "";
      }
    }
  };

  const handleRemoveLogo = async (brandId) => {
    try {
      setUploadingId(brandId);
      setError("");
      setSuccess("");

      await deleteCategoryImage(brandId);
      setSuccess(t.successRemoveLogo);
      await loadCategories();
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.uploadError,
      );
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-5xl px-4 pb-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
          {t.description}
        </p>
      </section>

      {(error || success) && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
        </div>
      )}

      <section className="mx-auto max-w-5xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {t.name}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder={t.namePlaceholder}
                maxLength={100}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-950 outline-none transition-all focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-neutral-200 px-4 py-3 text-xs font-semibold text-neutral-700 hover:border-neutral-950"
                >
                  {t.cancel}
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-neutral-950 px-5 py-3 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-40"
              >
                {saving ? t.saving : editingId ? t.save : t.add}
              </button>
            </div>
          </div>
        </form>

        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-neutral-400">
              {t.loading}
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-neutral-400">
              {t.empty}
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <span className="text-[10px] font-medium text-neutral-300">
                          {t.noLogo}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-950">
                        {category.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        ID: {category.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[category.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleUploadLogo(category.id, file);
                        }
                      }}
                    />

                    <button
                      type="button"
                      disabled={uploadingId === category.id}
                      onClick={() =>
                        fileInputRefs.current[category.id]?.click()
                      }
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700 hover:border-neutral-950 disabled:opacity-40"
                    >
                      {uploadingId === category.id ? t.uploading : t.upload}
                    </button>

                    {category.imageUrl && (
                      <button
                        type="button"
                        disabled={uploadingId === category.id}
                        onClick={() => void handleRemoveLogo(category.id)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-500 hover:border-neutral-950 disabled:opacity-40"
                      >
                        {t.removeLogo}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700 hover:border-neutral-950"
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(category.id)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] font-semibold text-red-600 hover:border-red-600 hover:bg-red-50"
                    >
                      {t.delete}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-neutral-950/30 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            onClick={closeDeleteModal}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-950">
              {t.deleteTitle}
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {t.deleteBody}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:border-neutral-950 disabled:opacity-40"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
              >
                {deleting ? t.saving : t.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategoryPage;
