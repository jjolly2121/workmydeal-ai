package com.workmydeal.backend.service;

import com.workmydeal.backend.model.Note;
import com.workmydeal.backend.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final AuditHistoryService auditHistoryService;

    public NoteService(
            NoteRepository noteRepository,
            AuditHistoryService auditHistoryService
    ) {
        this.noteRepository = noteRepository;
        this.auditHistoryService = auditHistoryService;
    }

    public List<Note> getNotesByDeal(Long dealId) {
        return noteRepository.findByDealIdOrderByCreatedAtDesc(dealId);
    }

    public Note createNote(Long dealId, Note note) {
        note.setDealId(dealId);

        Note savedNote = noteRepository.save(note);

        auditHistoryService.record(
                "CREATE",
                "NOTE",
                savedNote.getId(),
                note.getAuthorName(),
                "Note added to deal " + dealId
        );

        return savedNote;
    }
}
