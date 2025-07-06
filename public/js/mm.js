document.addEventListener('DOMContentLoaded', function() {
    // Show/hide search suggestions
    const searchInput = document.querySelector('.search-input');
    const suggestions = document.querySelector('.suggestions');
    
    searchInput.addEventListener('focus', () => {
        suggestions.style.display = 'block';
    });
    
    searchInput.addEventListener('blur', () => {
        // Small delay to allow clicking on suggestions
        setTimeout(() => {
            suggestions.style.display = 'none';
        }, 200);
    });
    
    // Handle suggestion selection
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            searchInput.value = item.textContent;
            suggestions.style.display = 'none';
            // Would normally trigger a search here
            alert('Searching for: ' + item.textContent);
        });
    });
    
    // Filter tabs interaction
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.filter-tab.active').classList.remove('active');
            tab.classList.add('active');
            // Would normally filter content here
            alert('Filtering by: ' + tab.textContent);
        });
    });
    
    // Post question button
    document.querySelector('.post-button').addEventListener('click', () => {
        const questionText = document.querySelector('.question-input').value;
        if (questionText.trim() !== '') {
            alert('Question posted: ' + questionText);
            document.querySelector('.question-input').value = '';
        } else {
            alert('Please enter your question before posting');
        }
    });

    // Add click handlers for topic tags
    document.querySelectorAll('.topic-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            alert('Showing content for topic: ' + tag.textContent);
        });
    });

    // Add click handlers for question items in sidebar
    document.querySelectorAll('.question-item').forEach(item => {
        item.addEventListener('click', () => {
            const questionTitle = item.querySelector('.question-title').textContent;
            alert('Showing details for question: ' + questionTitle);
        });
    });

    // Add click handlers for post action buttons
    document.querySelectorAll('.post-actions button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const postTitle = button.closest('.post').querySelector('.post-title').textContent;
            alert('Preparing follow-up question for post: ' + postTitle);
        });
    });
});