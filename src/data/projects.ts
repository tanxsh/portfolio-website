export type Project = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  tech: string[];
  link: string;
};

export const projects: Project[] = [
  {
    slug: "inventory-cli",
    title: "Inventory CLI with Restock Planner",
    summary:
      "A command-line product tracker with a restock planner that budgets what to reorder.",
    description:
      "A pure Python 3 command-line tool for tracking a store's products, with full CRUD commands (add, list, get, update, delete) backed by a local JSON file. Writes are atomic — data is saved to a temporary file and swapped in — so a failed command never corrupts data or wastes an ID. The custom restock feature lets a shop owner set a minimum stock target and instantly see which products are short, how many units to buy, the per-product cost, and the total budget, computed with Decimal to avoid rounding errors.",
    tech: ["Python 3", "Standard Library", "JSON", "CLI Design"],
    link: "https://github.com/tanxsh/Inventory-CLI-with-Restock-Planner",
  },
  {
    slug: "multi-agent-rag-research-assistant",
    title: "Multi-Agent RAG Research Assistant",
    summary:
      "Fully local multi-agent PDF Q&A with intelligent routing and self-correction.",
    description:
      "A research assistant that answers questions about uploaded PDFs using a five-agent LangGraph pipeline: a Router classifies intent, a Retriever fetches relevant chunks from ChromaDB, an Analyzer validates that the retrieved context actually answers the question, a Synthesizer drafts the grounded answer, and a Generalist handles general-knowledge queries. If the Analyzer flags retrieved documents as irrelevant, the graph self-corrects by re-routing to the Generalist instead of hallucinating from bad context. The entire stack — Llama 3.2 via Ollama, HuggingFace embeddings, ChromaDB, Streamlit UI — runs locally with zero API costs and no data leaving the machine.",
    tech: ["LangGraph", "Llama 3.2", "Ollama", "ChromaDB", "Streamlit", "Python"],
    link: "https://github.com/tanxsh/Multi-Agent-RAG-Research-Assistant",
  },
  {
    slug: "airbnb-california-market-analysis",
    title: "Airbnb California Market Analysis",
    summary:
      "Demand-driver prediction and listing segmentation across 8 California markets.",
    description:
      "A machine learning analysis of Inside Airbnb data spanning 8 California markets, answering three questions: what drives listing demand, what distinct listing segments exist, and does segmentation improve prediction. Compared Linear Regression, Random Forest, and tuned XGBoost to predict demand (reviews per month), then used K-Means to segment listings into three tiers — budget, mid-tier, and premium. Finally, cluster-specific XGBoost models were tested against a global baseline; the best cluster outperformed it (R² 0.5194 vs 0.4830), showing that demand behaves differently per segment. Delivered market-specific recommendations for hosts and platform strategists.",
    tech: ["Python", "XGBoost", "scikit-learn", "K-Means", "pandas", "Jupyter"],
    link: "https://github.com/tanxsh/Machine-Learning-Python-Project",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
