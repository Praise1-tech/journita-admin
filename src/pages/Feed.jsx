import { useState, useEffect, useCallback, useContext } from "react";
import { fmt, useDebounce, apiFetch } from "../lib";
import { RouterCtx } from "../App";
import Card        from "../component/ui/card";
import StatCard    from "../component/ui/StatCard";
import Table       from "../component/ui/Table";
import Badge       from "../component/ui/Badge";
import Btn         from "../component/ui/Btn";
import Avatar      from "../component/ui/Avatar";
import Modal       from "../component/ui/Modal";
import SearchInput from "../component/ui/SearchInput";
import Select      from "../component/ui/Select";
import PageHeader  from "../component/ui/PageHeader";

function PostThumb({ images = [] }) {
  if (!images.length) return (
    <div style={{ width: 44, height: 44, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 14, color: "#334155" }}>◻</span>
    </div>
  );
  return (
    <div style={{ position: "relative", width: 44, height: 44 }}>
      <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        <img src={images[0].thumbnail || images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.78)", borderRadius: 3, padding: "1px 4px", fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#e2e8f0" }}>
          +{images.length - 1}
        </div>
      )}
    </div>
  );
}

function PostModal({ post, open, onClose, onHide, onDelete, actionLoading }) {
  if (!post) return null;
  const u = post.user || {};
  return (
    <Modal open={open} onClose={onClose} title="Post Detail" width={500}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 16 }}>
        <Avatar name={u.name} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{u.name || "—"}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", marginTop: 2 }}>{u.email || "—"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Badge variant={post.isActive ? "active" : "suspended"}>{post.isActive ? "Active" : "Hidden"}</Badge>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#334155", marginTop: 4 }}>{fmt.datetime(post.createdAt)}</div>
        </div>
      </div>
      {post.images?.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: post.images.length === 1 ? "1fr" : "repeat(2,1fr)", gap: 6, marginBottom: 14 }}>
          {post.images.slice(0, 4).map((img, i) => (
            <div key={i} style={{ borderRadius: 7, overflow: "hidden", aspectRatio: "1", background: "#060a0f", border: "1px solid rgba(255,255,255,0.06)" }}>
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}
      {post.description && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7, padding: "11px 14px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Caption</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{post.description}</p>
        </div>
      )}
      {(post.location?.name || post.location?.city) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <span style={{ color: "#60a5fa", fontSize: 11 }}>◎</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#64748b" }}>
            {[post.location.name, post.location.city, post.location.country].filter(Boolean).join(" · ")}
          </span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 18 }}>
        {[
          { label: "Likes",    value: post.likesCount    || 0, color: "#F5A623" },
          { label: "Comments", value: post.commentsCount || 0, color: "#60a5fa" },
          { label: "Views",    value: post.views         || 0, color: "#94a3b8" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 7, padding: "10px 0", textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 900, color: s.color }}>{s.value.toLocaleString()}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant={post.isActive ? "danger" : "success"} full onClick={() => onHide(post)} disabled={actionLoading}>{post.isActive ? "Hide Post" : "Restore Post"}</Btn>
        <Btn variant="danger" onClick={() => onDelete(post)} disabled={actionLoading}>Delete</Btn>
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
}

export default function Feed() {
  const { showToast } = useContext(RouterCtx);
  const [posts,         setPosts]         = useState([]);
  const [total,         setTotal]         = useState(0);
  const [summary,       setSummary]       = useState({ total: 0, active: 0, inactive: 0, totalLikes: 0 });
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState("");
  const [statusF,       setStatusF]       = useState("all");
  const [sortF,         setSortF]         = useState("newest");
  const [selected,      setSelected]      = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [confirmModal,  setConfirmModal]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const dSearch = useDebounce(search);

  const loadPosts = useCallback(async (pg, srch, stat, srt) => {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: 20, sort: srt });
    if (srch)           params.set("search", srch);
    if (stat !== "all") params.set("status", stat);
    const { ok, data } = await apiFetch(`/feed/all?${params}`);
    if (ok) {
      setPosts(data.posts || []);
      setTotal(data.total || 0);
      setSummary(data.summary || { total: 0, active: 0, inactive: 0, totalLikes: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(page, dSearch, statusF, sortF); }, [page, dSearch, statusF, sortF, loadPosts]);

  const doAction = async (post, action) => {
    setActionLoading(true);
    let result;
    if (action === "hide" || action === "restore") {
      result = await apiFetch(`/feed/${post._id}/moderate`, { method: "POST", body: JSON.stringify({ action: action === "hide" ? "reject" : "approve" }) });
    } else if (action === "delete") {
      result = await apiFetch(`/feed/${post._id}`, { method: "DELETE" });
    }
    setActionLoading(false); setConfirmModal(null); setModalOpen(false); setSelected(null);
    if (result?.ok) {
      showToast(action === "delete" ? "Post deleted" : action === "hide" ? "Post hidden" : "Post restored", action === "restore" ? "success" : "error");
      loadPosts(page, dSearch, statusF, sortF);
    } else {
      showToast(result?.data?.message || "Action failed", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Feed"
        sub={`${total.toLocaleString()} total posts`}
        actions={
          <>
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="User, caption, city…" width={185} />
            <Select value={statusF} onChange={v => { setStatusF(v); setPage(1); }} options={[{ value: "all", label: "All Posts" }, { value: "active", label: "Active" }, { value: "inactive", label: "Hidden" }]} />
            <Select value={sortF}   onChange={v => { setSortF(v);   setPage(1); }} options={[{ value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }, { value: "popular", label: "Most Liked" }]} />
          </>
        }
      />

      <div className="grid-4col">
        <StatCard label="Total Posts" value={summary.total.toLocaleString()}      sub="All time" accent />
        <StatCard label="Active"      value={summary.active.toLocaleString()}     sub="Visible to users" />
        <StatCard label="Hidden"      value={summary.inactive.toLocaleString()}   sub="Moderated / off" />
        <StatCard label="Total Likes" value={summary.totalLikes.toLocaleString()} sub="Across all posts" />
      </div>

      {loading ? (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", padding: "40px 0" }}>Loading feed posts…</div>
      ) : (
        <Card noPad>
          <Table
            columns={[
              { key: "images",        label: "Photo",     render: v => <PostThumb images={v} /> },
              { key: "user",          label: "Posted By", render: v => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={v?.name} size={28} />
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{v?.name || "—"}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569" }}>{v?.email || "—"}</div>
                  </div>
                </div>
              )},
              { key: "description",   label: "Caption",   render: v => (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748b", display: "block", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v || <em style={{ color: "#334155" }}>No caption</em>}
                </span>
              )},
              { key: "location",      label: "Location",  render: v => (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>
                  {v?.city ? `${v.city}${v.country ? `, ${v.country}` : ""}` : v?.name || "—"}
                </span>
              )},
              { key: "likesCount",    label: "Likes",     render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#F5A623", fontWeight: 700 }}>♥ {v || 0}</span> },
              { key: "commentsCount", label: "Cmts",      render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#60a5fa" }}>◆ {v || 0}</span> },
              { key: "createdAt",     label: "Posted",    render: v => (
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#64748b" }}>{fmt.date(v)}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#334155" }}>{fmt.time(v)}</div>
                </div>
              )},
              { key: "isActive",      label: "Status",    render: v => <Badge variant={v ? "active" : "suspended"}>{v ? "Active" : "Hidden"}</Badge> },
              { key: "_id",           label: "",          render: (_, row) => (
                <div style={{ display: "flex", gap: 5 }}>
                  <Btn size="sm" variant="ghost"                              onClick={e => { e.stopPropagation(); setSelected(row); setModalOpen(true); }}>View</Btn>
                  <Btn size="sm" variant={row.isActive ? "danger" : "success"} onClick={e => { e.stopPropagation(); setConfirmModal({ post: row, action: row.isActive ? "hide" : "restore" }); }}>{row.isActive ? "Hide" : "Show"}</Btn>
                  <Btn size="sm" variant="danger"                             onClick={e => { e.stopPropagation(); setConfirmModal({ post: row, action: "delete" }); }}>Del</Btn>
                </div>
              )},
            ]}
            data={posts}
            onRowClick={row => { setSelected(row); setModalOpen(true); }}
            emptyMsg="No feed posts found."
          />
          {total > 20 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 0" }}>
              <Btn size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", alignSelf: "center" }}>Page {page} of {Math.ceil(total / 20)}</span>
              <Btn size="sm" variant="ghost" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</Btn>
            </div>
          )}
        </Card>
      )}

      <PostModal post={selected} open={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }}
        onHide={post => { setModalOpen(false); setConfirmModal({ post, action: "hide" }); }}
        onDelete={post => { setModalOpen(false); setConfirmModal({ post, action: "delete" }); }}
        actionLoading={actionLoading} />

      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === "delete" ? "Delete Post" : confirmModal?.action === "hide" ? "Hide Post" : "Restore Post"} width={360}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 20px" }}>
          {confirmModal?.action === "delete" ? `Permanently delete this post by ${confirmModal?.post?.user?.name || "this user"}? This cannot be undone.`
            : confirmModal?.action === "hide"    ? `Hide this post by ${confirmModal?.post?.user?.name || "this user"}? It will no longer be visible to users.`
            : `Restore this post by ${confirmModal?.post?.user?.name || "this user"}? It will become visible again.`}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant={confirmModal?.action === "restore" ? "success" : "danger"} full
            onClick={() => doAction(confirmModal.post, confirmModal.action)} disabled={actionLoading}>
            {actionLoading ? "Processing…" : confirmModal?.action === "delete" ? "Yes, Delete" : confirmModal?.action === "hide" ? "Yes, Hide" : "Yes, Restore"}
          </Btn>
          <Btn variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}