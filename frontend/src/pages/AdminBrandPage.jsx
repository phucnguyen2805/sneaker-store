import { useCallback, useEffect, useRef, useState } from "react";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import {
  createBrand,
  deleteBrand,
  deleteBrandLogo,
  getBrands,
  updateBrand,
  uploadBrandLogo,
} from "../services/brandService.js";

function AdminBrandPage() {
  const { language } = useThemeLanguage();

  const text = {
    vi: {
      eyebrow: "Admin",
      title: "Quản lý Brand",
      description: "Thêm, sửa, xóa thương hiệu và upload logo (Cloudinary).",
      name: "Tên brand",
      namePlaceholder: "Ví dụ: Nike, Adidas...",
      logo: "Logo",
      noLogo: "Chưa có logo",
      add: "Thêm brand",
      save: "Lưu",
      cancel: "Hủy",
      edit: "Sửa",
      delete: "Xóa",
      upload: "Upload logo",
      removeLogo: "Xóa logo",
      empty: "Chưa có brand nào.",
      loading: "Đang tải...",
      saving: "Đang lưu...",
      uploading: "Đang upload...",
      loadError: "Không thể tải danh sách brand.",
      saveError: "Không thể lưu brand.",
      deleteError: "Không thể xóa brand.",
      uploadError: "Không thể upload logo.",
      nameRequired: "Vui lòng nhập tên brand.",
      deleteTitle: "Xóa brand?",
      deleteBody:
        "Brand sẽ bị xóa vĩnh viễn. Không xóa được nếu đang có sản phẩm dùng brand này.",
      deleteConfirm: "Xóa brand",
      successCreate: "Đã thêm brand.",
      successUpdate: "Đã cập nhật brand.",
      successDelete: "Đã xóa brand.",
      successUpload: "Đã upload logo.",
      successRemoveLogo: "Đã xóa logo.",
    },
    en: {
      eyebrow: "Admin",
      title: "Manage brands",
      description: "Create, edit, delete brands and upload logos (Cloudinary).",
      name: "Brand name",
      namePlaceholder: "e.g. Nike, Adidas...",
      logo: "Logo",
      noLogo: "No logo",
      add: "Add brand",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      upload: "Upload logo",
      removeLogo: "Remove logo",
      empty: "No brands yet.",
      loading: "Loading...",
      saving: "Saving...",
      uploading: "Uploading...",
      loadError: "Unable to load brands.",
      saveError: "Unable to save brand.",
      deleteError: "Unable to delete brand.",
      uploadError: "Unable to upload logo.",
      nameRequired: "Please enter a brand name.",
      deleteTitle: "Delete brand?",
      deleteBody:
        "This brand will be permanently deleted. It cannot be deleted if products still use it.",
      deleteConfirm: "Delete brand",
      successCreate: "Brand created.",
      successUpdate: "Brand updated.",
      successDelete: "Brand deleted.",
      successUpload: "Logo uploaded.",
      successRemoveLogo: "Logo removed.",
    },
  };

  const t = text[language] || text.vi;

  const [brands, setBrands] = useState([]);
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

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBrands();
      setBrands(data);
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
    const fetchBrands = async () => {
      await loadBrands();
    };

    fetchBrands();
  }, [loadBrands]);

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
        await updateBrand(editingId, name);
        setSuccess(t.successUpdate);
      } else {
        await createBrand(name);
        setSuccess(t.successCreate);
      }

      resetForm();
      await loadBrands();
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

      await deleteBrand(deletingId);

      if (editingId === deletingId) {
        resetForm();
      }

      setSuccess(t.successDelete);
      setDeleteModalOpen(false);
      setDeletingId(null);
      await loadBrands();
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

      await uploadBrandLogo(brandId, file);
      setSuccess(t.successUpload);
      await loadBrands();
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

      await deleteBrandLogo(brandId);
      setSuccess(t.successRemoveLogo);
      await loadBrands();
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
          ) : brands.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-neutral-400">
              {t.empty}
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {brands.map((brand) => (
                <li
                  key={brand.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                      {brand.imageUrl ? (
                        <img
                          src={brand.imageUrl}
                          alt={brand.name}
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
                        {brand.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        ID: {brand.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[brand.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleUploadLogo(brand.id, file);
                        }
                      }}
                    />

                    <button
                      type="button"
                      disabled={uploadingId === brand.id}
                      onClick={() => fileInputRefs.current[brand.id]?.click()}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700 hover:border-neutral-950 disabled:opacity-40"
                    >
                      {uploadingId === brand.id ? t.uploading : t.upload}
                    </button>

                    {brand.imageUrl && (
                      <button
                        type="button"
                        disabled={uploadingId === brand.id}
                        onClick={() => void handleRemoveLogo(brand.id)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-500 hover:border-neutral-950 disabled:opacity-40"
                      >
                        {t.removeLogo}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEdit(brand)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700 hover:border-neutral-950"
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(brand.id)}
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

export default AdminBrandPage;
