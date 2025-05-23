import React, { useState } from "react";

const DatabaseTree = ({ databases }) => {
  const [expandedDatabases, setExpandedDatabases] = useState({});

  // Toggle visibility of tables for a database
  const toggleDatabase = (dbName) => {
    setExpandedDatabases((prev) => ({
      ...prev,
      [dbName]: !prev[dbName], // Toggle expanded state
    }));
  };

  return (
    <div className="database-tree">
      {/* Root Node (SGBD) */}
      <div className="root-node" style={{ fontWeight: "light", marginBottom: "1rem" }}>
        Databases
      </div>

      {/* Database Nodes */}
      {databases.map((db, index) => (
        <div key={index} className="database-node">
          <div
            className="database-header"
            onClick={() => toggleDatabase(db.name)}
            style={{ cursor: "pointer", marginLeft: "1rem", marginBottom: "0.5rem" }}
          >
            {expandedDatabases[db.name] ? "-" : "|"} {db.name}
          </div>

          {/* Table Nodes (Visible when database is expanded) */}
          {expandedDatabases[db.name] && (
            <ul style={{ marginLeft: "2rem", listStyleType: "none" }}>
              {db.children.map((table, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>
                  {"- "+table.name+" ."}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default DatabaseTree;