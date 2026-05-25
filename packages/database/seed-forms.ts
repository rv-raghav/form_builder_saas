import { eq } from "drizzle-orm";
import { db } from "./index";
import { usersTable, formsTable, formFieldsTable } from "./schema";

export async function seedForms(): Promise<void> {
  const [creator] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "creator@demo.com"))
    .limit(1);

  if (!creator) {
    console.log("Skip form seed: creator@demo.com not found.");
    return;
  }

  const samples = [
    {
      title: "Startup Pitch Feedback",
      slug: "demo-startup-pitch",
      description: "Submit feedback on startup pitches, industry sector, value prop, and funding goals.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "startup",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Company Name",
          placeholder: "Acme Inc.",
          required: true,
          options: null as string[] | null,
        },
        {
          sortOrder: 1,
          type: "email",
          label: "Founder Email",
          placeholder: "founder@acme.com",
          required: true,
          options: null,
        },
        {
          sortOrder: 2,
          type: "single_select",
          label: "Industry Sector",
          placeholder: null,
          required: true,
          options: ["SaaS", "AI/ML", "FinTech", "HealthTech", "Hardware"],
        },
        {
          sortOrder: 3,
          type: "long_text",
          label: "Describe your value proposition",
          placeholder: "What problem do you solve and how?",
          required: false,
          options: null,
        },
        {
          sortOrder: 4,
          type: "number",
          label: "Target seed round raise ($ in millions)",
          placeholder: "2.5",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "Anime Fan Questionnaire",
      slug: "demo-anime-fan",
      description: "A fun survey exploring favorite anime titles, watch counts, and preferred genres.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "anime",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Favorite Anime",
          placeholder: "Steins;Gate",
          required: true,
          options: null,
        },
        {
          sortOrder: 1,
          type: "single_select",
          label: "Watched Count",
          placeholder: null,
          required: false,
          options: ["1-10", "11-50", "51-100", "100+"],
        },
        {
          sortOrder: 2,
          type: "multi_select",
          label: "Preferred Genres",
          placeholder: null,
          required: false,
          options: ["Shonen", "Shojo", "Seinen", "Isekai", "Slice of Life", "Mecha"],
        },
        {
          sortOrder: 3,
          type: "long_text",
          label: "What makes anime special to you?",
          placeholder: "Tell us about your favorite arcs or moments...",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "Gamer Preference Survey",
      slug: "demo-gamer-prefs",
      description: "Tell us about your primary gaming platform, favorite genres, and play schedule.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "game",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Gamer Tag / Username",
          placeholder: "PixelHero99",
          required: false,
          options: null,
        },
        {
          sortOrder: 1,
          type: "single_select",
          label: "Primary Platform",
          placeholder: null,
          required: true,
          options: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
        },
        {
          sortOrder: 2,
          type: "multi_select",
          label: "Favorite Game Genres",
          placeholder: null,
          required: false,
          options: ["RPG", "FPS", "Strategy", "Battle Royale", "Simulation", "Action-Adventure"],
        },
        {
          sortOrder: 3,
          type: "number",
          label: "Hours played per week",
          placeholder: "15",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "Developer Setup Survey",
      slug: "demo-dev-setup",
      description: "Gathering developer choices for operating systems, languages, and IDEs.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "tech",
      fields: [
        {
          sortOrder: 0,
          type: "single_select",
          label: "Primary OS",
          placeholder: null,
          required: true,
          options: ["macOS", "Linux", "Windows"],
        },
        {
          sortOrder: 1,
          type: "multi_select",
          label: "Programming Languages",
          placeholder: null,
          required: false,
          options: ["TypeScript", "Python", "Rust", "Go", "Java", "C++"],
        },
        {
          sortOrder: 2,
          type: "single_select",
          label: "Preferred IDE/Editor",
          placeholder: null,
          required: true,
          options: ["VS Code", "Cursor", "Neovim", "IntelliJ", "WebStorm"],
        },
        {
          sortOrder: 3,
          type: "long_text",
          label: "Describe your dream workspace setup",
          placeholder: "Monitors, keyboards, desk style...",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "Tech Conference RSVP",
      slug: "demo-event-rsvp",
      description: "Sample event-themed signup form for conference tickets, meals, and accommodations.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "event",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Full name",
          placeholder: "Jane Doe",
          required: true,
          options: null,
        },
        {
          sortOrder: 1,
          type: "email",
          label: "Email",
          placeholder: "you@example.com",
          required: true,
          options: null,
        },
        {
          sortOrder: 2,
          type: "single_select",
          label: "Ticket Type",
          placeholder: null,
          required: true,
          options: ["General Admission", "VIP", "Speaker", "Student"],
        },
        {
          sortOrder: 3,
          type: "multi_select",
          label: "Dietary Requirements",
          placeholder: null,
          required: false,
          options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal"],
        },
        {
          sortOrder: 4,
          type: "long_text",
          label: "Any special accessibility requests?",
          placeholder: "Let us know if you require any assistance...",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "Community Volunteer Registration",
      slug: "demo-community-signup",
      description: "Volunteer registration for park cleanup, senior care, animal shelters, and food drives.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "community",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Display name",
          placeholder: "How should we call you?",
          required: true,
          options: null,
        },
        {
          sortOrder: 1,
          type: "email",
          label: "Contact Email",
          placeholder: "volunteer@domain.com",
          required: true,
          options: null,
        },
        {
          sortOrder: 2,
          type: "multi_select",
          label: "Areas of Interest",
          placeholder: null,
          required: false,
          options: ["Food Pantry", "Youth Mentoring", "Park Cleanup", "Animal Shelter", "Senior Care"],
        },
        {
          sortOrder: 3,
          type: "single_select",
          label: "Availability",
          placeholder: null,
          required: true,
          options: ["Weekdays", "Weekends", "Evenings", "Flexible"],
        },
      ],
    },
    {
      title: "Cinephile Film Review",
      slug: "demo-movie-review",
      description: "Share your rating, theater experience, and written review of your latest film watch.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "movie",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Movie Title",
          placeholder: "Interstellar",
          required: true,
          options: null,
        },
        {
          sortOrder: 1,
          type: "number",
          label: "Rating (out of 10)",
          placeholder: "9",
          required: true,
          options: null,
        },
        {
          sortOrder: 2,
          type: "single_select",
          label: "Where did you watch it?",
          placeholder: null,
          required: false,
          options: ["Theater", "Streaming", "Physical Media", "Film Festival"],
        },
        {
          sortOrder: 3,
          type: "long_text",
          label: "Write your brief review",
          placeholder: "What worked? What didn't?",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "Operating System Preferences",
      slug: "demo-os-preferences",
      description: "Gathering desktop environments, package managers, and utility preferences.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "os",
      fields: [
        {
          sortOrder: 0,
          type: "single_select",
          label: "Favorite Desktop Environment",
          placeholder: null,
          required: true,
          options: ["GNOME", "KDE Plasma", "XFCE", "Aqua", "Windows Shell"],
        },
        {
          sortOrder: 1,
          type: "multi_select",
          label: "Must-have Utilities",
          placeholder: null,
          required: false,
          options: ["Terminal Emulator", "Package Manager", "File Manager", "Window Manager"],
        },
        {
          sortOrder: 2,
          type: "number",
          label: "Years using Linux/Unix",
          placeholder: "5",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "General Customer Inquiry",
      slug: "demo-general-inquiry",
      description: "Standard contact and request submission form.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "default",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Your Name",
          placeholder: "John Smith",
          required: true,
          options: null,
        },
        {
          sortOrder: 1,
          type: "email",
          label: "Your Email",
          placeholder: "john@smith.com",
          required: true,
          options: null,
        },
        {
          sortOrder: 2,
          type: "short_text",
          label: "Subject",
          placeholder: "Billing, Bug report, Partnering...",
          required: true,
          options: null,
        },
        {
          sortOrder: 3,
          type: "long_text",
          label: "Message Body",
          placeholder: "Explain your inquiry in detail...",
          required: true,
          options: null,
        },
      ],
    },
  ];

  for (const sample of samples) {
    const existing = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, sample.slug))
      .limit(1);

    let formId: string;
    if (existing.length > 0) {
      formId = existing[0]!.id;
      await db
        .update(formsTable)
        .set({
          title: sample.title,
          description: sample.description,
          status: sample.status,
          visibility: sample.visibility,
          theme: sample.theme,
          publishedAt:
            sample.status === "published" ? new Date() : null,
        })
        .where(eq(formsTable.id, formId));
      await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));
      console.log(`Updated demo form: ${sample.slug}`);
    } else {
      const [form] = await db
        .insert(formsTable)
        .values({
          userId: creator.id,
          title: sample.title,
          slug: sample.slug,
          description: sample.description,
          status: sample.status,
          visibility: sample.visibility,
          theme: sample.theme,
          publishedAt: sample.status === "published" ? new Date() : null,
        })
        .returning();
      if (!form) continue;
      formId = form.id;
      console.log(`Created demo form: ${sample.slug}`);
    }

    await db.insert(formFieldsTable).values(
      sample.fields.map((f) => ({
        formId,
        sortOrder: f.sortOrder,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        options: f.options,
      })),
    );
  }
}
