# How to use HelpDesk Pro

HelpDesk Pro is a local support desk. You use it to take in requests, see what is late, assign an owner, reply, and close the loop. There is no sign-in. The **Working as** menu in the sidebar decides whose name is written on replies and updates.

## Start it

From the project folder:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run db:seed` loads a sample queue (VPN, billing, access, hardware) so the overview is useful immediately. Running the seed again replaces tickets, replies, and notifications. People are kept and updated.

If the database commands complain about `DATABASE_URL`, add a `.env` file:

```
DATABASE_URL="file:./dev.db"
```

## Who you are working as

Use **Working as** at the bottom of the sidebar.

| Person | Role | Use them to |
| --- | --- | --- |
| Jordan Davis | Admin | Run the queue and see every workload |
| Ava Thompson, Sam Okonkwo, Priya Shah | Agent | Take tickets and reply |
| Maya Patel, Leo Chen, Nora Ibrahim | Requester | File requests and answer questions |

Switching person changes three things:

- New replies and status changes are recorded under that name
- **Assigned to me** / **My requests** on the queue follows that person
- The bell shows that person’s updates
- Requesters do not see internal notes

## A normal agent day

1. Open **Overview**.
2. Start with **Work these first**. Those tickets are overdue, unassigned, or critical.
3. Open a ticket.
4. Click **Take this ticket** if nobody owns it. That assigns it to you and marks it in progress.
5. Reply with the next concrete step. Use **Insert a saved reply** when the answer is one you send often, then edit it before sending.
6. If you are blocked on the requester, click **Waiting on requester**.
7. When the fix is done, write **Resolution notes** (what fixed it, or what they should do) and click **Mark resolved**.
8. After they confirm, click **Close**. If the problem comes back, click **Reopen**.

The bell picks up assignments, public replies, and escalations for the person you are working as. Opening the bell marks them read.

## File a request

1. Switch **Working as** to the person who has the problem, or stay as an agent and pick them in the form.
2. Open **New ticket**.
3. Write a subject and what happened. Ten characters is the minimum for the description, so include the error or the expected result.
4. Choose a category and priority.
5. Leave the due date empty unless you already have a deadline. The desk sets a response target from the priority:

| Priority | Response target |
| --- | --- |
| Critical | 4 hours |
| High | 8 hours |
| Medium | 24 hours |
| Low | 72 hours |

6. Create the ticket. You land on it and can keep working.

## Statuses

| Status | Meaning |
| --- | --- |
| Open | Nobody has started, or it was reopened |
| In progress | An agent is working on it |
| Waiting | Blocked on the requester |
| Resolved | A fix was delivered and written in the resolution notes |
| Closed | Finished |

When a ticket is **Waiting** and the requester replies, it returns to **Open**. When an agent replies, it returns to **In progress**. You do not have to remember to flip the status after the answer arrives.

## Queue

**Queue** is the full list. The chips are the views you will use most:

- **Open** — not started
- **Assigned to me** or **My requests** — your work
- **Unassigned** — needs an owner
- **Overdue** — still active and past the due date

Search from the top bar matches the ticket number, subject, description, requester, and assignee. Filters for status, priority, category, and sort sit under the chips. Click any row to open the ticket.

## Replies, notes, and feedback

- A normal reply is visible to everyone, including when you switch to the requester.
- Check **Internal note** for desk-only context, such as “waiting on a credit memo.” Requesters do not see these.
- **Escalate** raises the priority one step (Low → Medium → High → Critical), records why, and puts the ticket back on the attention list. Edit the reason first if the default sentence is wrong.
- After a ticket is resolved or closed, anyone can leave a 1–5 rating. Do this while **Working as** the requester if you want the rating to read as theirs. One rating is kept per ticket.

## Team and saved replies

**Team** shows how many active and overdue tickets each agent has. Open a name to see only their queue before you assign more work. **View unassigned tickets** is the pile that still needs an owner.

**Saved replies** are the canned answers. Add the ones your team repeats (password reset, “need more detail”, “please confirm”). Delete the ones you no longer want. They are inserted from the ticket reply box.

## What this desk is for

Use it to run a small support queue on your own machine: intake, ownership, due dates, the conversation, and a record of what changed. It does not send email or connect to Slack. The people in the sidebar are the whole directory.
