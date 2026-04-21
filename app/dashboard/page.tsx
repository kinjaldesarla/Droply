"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Search,
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  Star,
  Trash2,
  Home,
  Folder,
  FileText,
  FileImage,
  File,
  Cloud,
  Download,
  Eye,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Loader2,
  Plus,
} from "lucide-react";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "image" | "pdf" | "doc" | "other";
  size?: string;
  modified: string;
  starred: boolean;
  deleted: boolean;
  parentId: string | null;
  thumbnail?: string;
  url?: string;
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [section, setSection] = useState<"files" | "starred" | "trash">(
    "files"
  );

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "All Files" }]);

  const [storage, setStorage] = useState({
    used: 0,
    limit: 0,
    remaining: 0,
  });

  const userId = user?.id;

  const displayName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "User";

  useEffect(() => {
    if (userId) {
      fetchFiles();
      fetchStorage();
    }
  }, [userId]);

  const fetchStorage = async () => {
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      if (res.ok) setStorage(data);
    } catch {}
  };
const goBack = () => {
  if (breadcrumbs.length <= 1) return;

  const newBreadcrumbs = breadcrumbs.slice(0, -1);
  const last = newBreadcrumbs[newBreadcrumbs.length - 1];

  setBreadcrumbs(newBreadcrumbs);
  setCurrentFolderId(last?.id ?? null);
  fetchFiles(last?.id ?? null);
};
  const fetchFiles = async (folderId: string | null = null) => {
  try {
    setLoading(true);

    const url = new URL("/api/files", window.location.origin);

    url.searchParams.append("userId", userId || "");

    // IMPORTANT FIX
    if (folderId) {
      url.searchParams.append("parentId", folderId);
    }

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) throw new Error();

    const mapped = data.map((f: any) => ({
      id: f.id,
      name: f.name,
      type: f.isFolder ? "folder" : "file",
      fileType: f.type?.startsWith("image")
        ? "image"
        : f.type?.includes("pdf")
        ? "pdf"
        : "other",
      size: f.size ? `${(f.size / 1024).toFixed(1)} KB` : undefined,
      modified: new Date(f.createdAt).toLocaleDateString(),
      starred: f.isStarred,
      deleted: f.isTrash,
      parentId: f.parentId,
      thumbnail: f.thumbnailUrl,
      url: f.fileUrl,
    }));

    setFiles(mapped);
  } catch {
    toast.error("Failed to load files");
  } finally {
    setLoading(false);
  }
};
const createFolder = async () => {
  const name = prompt("Folder name");
  if (!name) return;

  try {
    const res = await fetch("/api/floder/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        parentId: currentFolderId,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.folder) {
      throw new Error(data?.error || "Failed to create folder");
    }

    setFiles((prev) => [
      {
        id: data.folder.id,
        name: data.folder.name,
        type: "folder",
        modified: "Just now",
        starred: false,
        deleted: false,
        parentId: currentFolderId,
      },
      ...prev,
    ]);

    toast.success("Folder created successfully");
  } catch (err) {
    toast.error("Failed to create folder");
  }
};

const handleUpload = async (file: File) => {
  try {
    setUploading(true);

    const formData = new FormData();

    // IMPORTANT: must match backend key
    formData.append("file", file);

    // backend expects THIS name
    formData.append("userId", userId || "");

    // IMPORTANT: must match backend (parentId, NOT parent_id)
    if (currentFolderId) {
      formData.append("parentId", currentFolderId);
    }

    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Upload failed");
    }

    setFiles((prev) => [
      {
        id: data.id,
        name: data.name,
        type: "file",
        fileType: data.type?.startsWith("image")
          ? "image"
          : data.type?.includes("pdf")
          ? "pdf"
          : "other",
        size: data.size ? `${(data.size / 1024).toFixed(1)} KB` : "",
        modified: "Just now",
        starred: false,
        deleted: false,
        parentId: data.parentId || null,
        url: data.fileUrl,
      },
      ...prev,
    ]);

    toast.success("Uploaded successfully 🚀");
  } catch (err) {
    console.error(err);
    toast.error("Upload failed");
  } finally {
    setUploading(false);
  }
};

const toggleStar = async (id: string) => {
  const file = files.find((f) => f.id === id);
  if (!file) return;

  setFiles((prev) =>
    prev.map((f) =>
      f.id === id ? { ...f, starred: !f.starred } : f
    )
  );

  await fetch(`/api/files/${id}/star`, {
    method: "PATCH",
  });
};

const toggleTrash = async (id: string) => {
  try {
    const res = await fetch(`/api/files/${id}/trash`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error();

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, deleted: !f.deleted } : f
      )
    );

    toast.success("Updated successfully");
  } catch {
    toast.error("Action failed");
  }
};
const permanentDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/files/${id}/delete`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) throw new Error();

    setFiles((prev) => prev.filter((f) => f.id !== id));

    toast.success("Deleted successfully");
  } catch {
    toast.error("Delete failed");
  }
};
  const emptyTrash = async () => {
  try {
    const res = await fetch("/api/files/empty-trash", {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) throw new Error();

    // refresh UI after delete
    await fetchFiles(currentFolderId);

    toast.success(data.message || "Trash emptied successfully");
  } catch (err) {
    toast.error("Failed to empty trash");
  }
};
const openFolder = (file: FileItem) => {
  if (file.type !== "folder") return;

  setCurrentFolderId(file.id);

  setBreadcrumbs((prev) => [
    ...prev,
    { id: file.id, name: file.name },
  ]);

  // 🔥 CRITICAL FIX
  fetchFiles(file.id);
};

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matches = file.name
        .toLowerCase()
        .includes(search.toLowerCase());

      if (section === "trash") return file.deleted && matches;
      if (section === "starred")
        return file.starred && !file.deleted && matches;

      return (
        !file.deleted &&
        file.parentId === currentFolderId &&
        matches
      );
    });
  }, [files, section, search, currentFolderId]);

  const storagePercent =
    storage.limit > 0 ? (storage.used / storage.limit) * 100 : 0;

  const getIcon = (file: FileItem) => {
    if (file.type === "folder")
      return <Folder className="w-6 h-6 text-violet-400" />;

    if (file.fileType === "image")
      return <FileImage className="w-6 h-6 text-pink-400" />;

    if (file.fileType === "pdf")
      return <FileText className="w-6 h-6 text-rose-400" />;

    return <File className="w-6 h-6 text-slate-400" />;
  };

  const logout = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded) return null;


  return (
    <div className="min-h-screen bg-[#06060b] text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 top-0 left-0 h-screen flex flex-col w-72 border-r border-white/10 bg-white/5 backdrop-blur-2xl transition-transform duration-300 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
<div>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Drop<span className="text-violet-400">ly</span>
          </Link>

          <button
            className="lg:hidden"
            onClick={() => setMobileMenu(false)}
          >
            <X />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400">Welcome back</p>
            <Link
    href="/profile"
    
  >
  <p className="text-xs text-zinc-500 mt-1 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
  </Link>
          
          </div>
        </div>
</div>
<div className="px-4 space-y-2 flex-1">
  <nav className="px-4 space-y-2 ">
          {[
            { id: "files", icon: Home, label: "All Files" },
            { id: "starred", icon: Star, label: "Starred" },
            { id: "trash", icon: Trash2, label: "Trash" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                section === item.id
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          
        </nav>
</div>
      <div className="p-4 mt-auto border-t border-white/10">
          <button
            onClick={logout}
            className="mt-4 w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 border-b border-white/10 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="lg:hidden"
            >
              <Menu />
            </button>

            <div>
             <div className="flex items-center gap-2 text-xs text-zinc-500">
  {breadcrumbs.map((crumb, i) => (
    <div key={i} className="flex items-center gap-2">
      {i > 0 && <ChevronRight className="w-3 h-3" />}

      <button
        onClick={() => {
          const newPath = breadcrumbs.slice(0, i + 1);
          setBreadcrumbs(newPath);
          setCurrentFolderId(crumb.id);
          fetchFiles(crumb.id);
        }}
        className="hover:text-white transition"
      >
        {crumb.name}
      </button>
    </div>
  ))}
</div>
              <h1 className="text-xl font-semibold mt-1">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-72 pl-10 pr-4 h-10 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-violet-500"
              />
            </div>

            <button
              onClick={createFolder}
              className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:block">Folder</span>
            </button>
            {section === "trash" && (
  <button
    onClick={emptyTrash}
    className="h-10 px-4 rounded-xl bg-gray-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20  flex items-center gap-2 transition"
  >
    <Trash2 className="w-4 h-4 text-red-400" />
    <span>Empty Trash</span>
  </button>
)}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-4 p-4 lg:p-8 pb-0">
          {[
            ["Total Items", filteredFiles.length],
            [
              "Folders",
              filteredFiles.filter((f) => f.type === "folder").length,
            ],
            [
              "Files",
              filteredFiles.filter((f) => f.type === "file").length,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
            >
              <p className="text-sm text-zinc-400">{label}</p>
              <h2 className="text-3xl font-bold mt-2">{value}</h2>
            </div>
          ))}
        </section>

        {/* Files */}
        <main className="flex-1 p-4 lg:p-8">
          {loading ? (
            <div className="grid md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
              <Sparkles className="w-12 h-12 text-violet-400 mb-4" />
              <h3 className="text-2xl font-semibold">
                Nothing here yet
              </h3>
              <p className="text-zinc-500 mt-2">
                Upload files or create folders to begin.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] backdrop-blur-xl p-4 transition"
                >
                  <div
                    onClick={() => openFolder(file)}
                    className="cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      {getIcon(file)}
                    </div>

                    <h3 className="font-medium truncate">
                      {file.name}
                    </h3>

                    <p className="text-xs text-zinc-500 mt-1">
                      {file.size || "Folder"} • {file.modified}
                    </p>
                  </div>

                  {file.type === "file" && (
                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => toggleStar(file.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            file.starred
                              ? "fill-violet-400 text-violet-400"
                              : ""
                          }`}
                        />
                      </button>

                      <button
                        onClick={() =>
                          file.url && window.open(file.url, "_blank")
                        }
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          file.url &&
                          window.open(
                            `${file.url}?ik-attachment=true`,
                            "_blank"
                          )
                        }
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                     <button
      onClick={() => toggleTrash(file.id)}
      className={`p-2 rounded-xl transition ${
        section === "trash"
          ? "bg-green-500/10 hover:bg-green-500/20"
          : "bg-red-500/10 hover:bg-red-500/20"
      }`}
    >
      {section === "trash" ? (
        <Plus className="w-4 h-4 text-green-400" />
      ) : (
        <Trash2 className="w-4 h-4 text-red-400" />
      )}
    </button>

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleUpload(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}