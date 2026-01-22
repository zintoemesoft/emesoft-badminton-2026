document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. Team Data Configuration
    // ---------------------------------------------------------
    const teamsDB = {
        "Đội 1": { 
            members: [ {name: "Khoa", level: 3}, {name: "Dung", level: 1} ]
        },
        "Đội 2": { 
            members: [ {name: "A.Cường", level: 3}, {name: "Tiên", level: 1} ]
        },
        "Đội 3": { 
            members: [ {name: "A.Hiếu Nguyễn", level: 3}, {name: "Ly", level: 1} ]
        },
        "Đội 4": { 
            members: [ {name: "Hiếu Trần", level: 3}, {name: "Hùng Nguyễn", level: 1} ]
        },
        "Đội 5": { 
            members: [ {name: "Phúc", level: 3}, {name: "Tuyền", level: 1} ]
        },
        "Đội 6": { 
            members: [ {name: "Thùy", level: 2}, {name: "Hiếu NPM", level: 2} ]
        },
        "Đội 7": { 
            members: [ {name: "A.Nhat", level: 2}, {name: "Kiên Nguyễn", level: 2} ]
        },
        "Đội 8": { 
            members: [ {name: "Lệ", level: 2}, {name: "Hưng NM", level: 2} ]
        },
        "Đội 9": { 
            members: [ {name: "Kiệt", level: 2}, {name: "A.Đức", level: 2} ]
        }
    };

    const getIcon = (level) => {
        if (level === 3) return '💪'; 
        if (level === 2) return '⚖️'; 
        return '🐣'; 
    };

    // ---------------------------------------------------------
    // 2. Inject Inline Details
    // ---------------------------------------------------------
    const matchRows = document.querySelectorAll('.match-row, .match-card');

    matchRows.forEach(row => {
        const teamNames = row.querySelectorAll('.team-name');
        if (teamNames.length !== 2) return;

        const nameA = teamNames[0].innerText.trim();
        const nameB = teamNames[1].innerText.trim();
        const dataA = teamsDB[nameA];
        const dataB = teamsDB[nameB];

        if (!dataA && !dataB) return;

        // Create the expansion container
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'match-expanded-details';
        
        // Build HTML for Roster A
        const htmlA = dataA 
            ? dataA.members.map(m => `<div>${getIcon(m.level)} ${m.name}</div>`).join('') 
            : '<div class="t-unknown">Undefined</div>';
            
        // Build HTML for Roster B
        const htmlB = dataB 
            ? dataB.members.map(m => `<div>${getIcon(m.level)} ${m.name}</div>`).join('') 
            : '<div class="t-unknown">Undefined</div>';

        detailsDiv.innerHTML = `
            <div class="expanded-col left">
                <div class="exp-team-name">${nameA}</div>
                <div class="exp-roster">${htmlA}</div>
            </div>
            <div class="expanded-divider"></div>
            <div class="expanded-col right">
                <div class="exp-team-name">${nameB}</div>
                <div class="exp-roster">${htmlB}</div>
            </div>
        `;

        // Append to the row
        row.appendChild(detailsDiv);
    });

    // ---------------------------------------------------------
    // 3. Smooth Scroll & Animations
    // ---------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    matchRows.forEach(item => {
        item.classList.add('fade-in-scroll');
        observer.observe(item);
    });
});
