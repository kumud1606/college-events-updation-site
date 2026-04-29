import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { downloadCertificatePdf } from "../utils/certificate";
import { normalizeEvent } from "../utils/normalizers";

function renderRoleLabel(item) {
  return item.roleLabel || "Participant";
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCertificates() {
      const [certificatesResponse, registrationsResponse] = await Promise.all([
        api.getCertificates(),
        api.getMyRegistrations()
      ]);

      if (!isMounted) {
        return;
      }

      setCertificates(
        certificatesResponse.certificates.map((certificate) => ({
          ...certificate,
          event: normalizeEvent(certificate.event)
        }))
      );
      setRegistrations(
        registrationsResponse.registrations.map((registration) => ({
          ...registration,
          event: normalizeEvent(registration.event)
        }))
      );
    }

    loadCertificates()
      .catch(() => {
        setCertificates([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sections = useMemo(() => {
    const downloaded = certificates.filter((certificate) => certificate.downloadedAt);
    const yetToDownload = certificates.filter((certificate) => !certificate.downloadedAt);
    const yetToReceive = registrations.filter((registration) => registration.event.status !== "finished");

    return { downloaded, yetToDownload, yetToReceive };
  }, [certificates, registrations]);

  async function handleDownload(certificate) {
    downloadCertificatePdf({
      studentName: user?.name || user?.enrollment || "Graphic Era Student",
      clubName: certificate.event.club?.name || "Graphic Era Club",
      eventTitle: certificate.event.title,
      roleLabel: renderRoleLabel(certificate),
      venue: certificate.event.venue,
      dateLabel: certificate.event.date
    });

    await api.markCertificateDownloaded(certificate.id);

    setCertificates((current) =>
      current.map((item) =>
        item.id === certificate.id ? { ...item, downloadedAt: new Date().toISOString() } : item
      )
    );
  }

  function renderCertificateList(items, emptyText, showButton) {
    if (items.length === 0) {
      return <p className="certificate-empty">{emptyText}</p>;
    }

    return (
      <div className="certificate-list">
        {items.map((item, index) => (
          <article key={item.id} className="certificate-card" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="certificate-card__header">
              <div>
                <p className="eyebrow">Certificate Event</p>
                <h3>{item.event.title}</h3>
                <p>{item.event.club?.name}</p>
              </div>
              <span className={`event-status event-status--${item.event.status}`}>{item.event.statusLabel}</span>
            </div>
            <div className="certificate-card__meta">
              <span>{item.event.date}</span>
              <span>{item.event.venue}</span>
              <span>{renderRoleLabel(item)}</span>
            </div>
            {showButton ? (
              <button
                type="button"
                className="primary-button certificate-card__button"
                onClick={() => handleDownload(item)}
              >
                Download Certificate PDF
              </button>
            ) : null}
          </article>
        ))}
      </div>
    );
  }

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="certificates-page">
        {loading ? <p>Loading certificates...</p> : null}

        <section className="certificate-section certificate-section--downloaded">
          <div className="certificate-section__heading">
            <h2>Downloaded</h2>
            <span>{sections.downloaded.length}</span>
          </div>
          {renderCertificateList(sections.downloaded, "No certificates downloaded yet.", false)}
        </section>

        <section className="certificate-section certificate-section--pending-download">
          <div className="certificate-section__heading">
            <h2>Yet to Download</h2>
            <span>{sections.yetToDownload.length}</span>
          </div>
          {renderCertificateList(sections.yetToDownload, "No finished events are waiting for download.", true)}
        </section>

        <section className="certificate-section certificate-section--pending-issue">
          <div className="certificate-section__heading">
            <h2>Yet to Receive</h2>
            <span>{sections.yetToReceive.length}</span>
          </div>
          {renderCertificateList(
            sections.yetToReceive,
            "No upcoming or ongoing certificates are pending.",
            false
          )}
        </section>
      </section>
    </AppShell>
  );
}
