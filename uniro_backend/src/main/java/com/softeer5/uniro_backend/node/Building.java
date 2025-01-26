package com.softeer5.uniro_backend.node;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Building {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(length = 20)
	private String phoneNumber;

	@Column(length = 100)
	private String address;

	@Column(length = 30)
	private String name;

	@Column(length = 200)
	private String imageUrl;

	private int level;

	private Long nodeId;

	@Builder
	private Building(String phoneNumber, String address, String name, String imageUrl, int level, Long nodeId) {
		this.phoneNumber = phoneNumber;
		this.address = address;
		this.name = name;
		this.imageUrl = imageUrl;
		this.level = level;
		this.nodeId = nodeId;
	}
}
